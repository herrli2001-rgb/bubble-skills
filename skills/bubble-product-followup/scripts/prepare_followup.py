#!/usr/bin/env python3
"""Build a reviewable local quote/pricing plan; never connects to a shop."""
import argparse
import csv
from decimal import Decimal, InvalidOperation, ROUND_CEILING
import json
from pathlib import Path

KEY_FIELDS = ("supplier", "product_id", "sku", "specification")


def money(value, label, positive=False):
    try:
        number = Decimal(str(value))
    except InvalidOperation as exc:
        raise ValueError(f"Invalid decimal in {label}") from exc
    if not number.is_finite() or number < 0 or (positive and number == 0):
        raise ValueError(f"{label} must be a finite {'positive' if positive else 'non-negative'} number")
    return number


def decimal_text(value):
    text = format(value, "f")
    return text.rstrip("0").rstrip(".") if "." in text else text


def read_rows(path, current=False):
    required = set(KEY_FIELDS) | {"cost"} | ({"retail"} if current else set())
    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if not required.issubset(reader.fieldnames or []):
            raise ValueError(f"{path.name}: required columns: {', '.join(sorted(required))}")
        rows = {}
        for line, row in enumerate(reader, 2):
            if None in row or any(row.get(field) is None for field in required):
                raise ValueError(f"{path.name}:{line}: malformed CSV row")
            key = tuple(row[field].strip() for field in KEY_FIELDS)
            if not all(key):
                raise ValueError(f"{path.name}:{line}: supplier/product/SKU/specification cannot be empty")
            if key in rows:
                raise ValueError(f"{path.name}:{line}: duplicate exact identity {key}")
            normalized = dict(zip(KEY_FIELDS, key))
            normalized["cost"] = money(row["cost"], f"{path.name}:{line}:cost")
            if current:
                normalized["retail"] = money(row["retail"], f"{path.name}:{line}:retail")
            rows[key] = normalized
    if not rows:
        raise ValueError(f"{path.name}: no data rows")
    return rows


def load_policy(path):
    policy = json.loads(path.read_text(encoding="utf-8"))
    mode = policy.get("mode")
    if mode not in ("markup", "margin"):
        raise ValueError("Policy mode must be markup or margin")
    increment = money(policy.get("round_up_to", ""), "round_up_to", positive=True)
    if mode == "markup":
        factor = money(policy.get("multiplier", ""), "multiplier", positive=True)
    else:
        factor = money(policy.get("target_margin", ""), "target_margin")
        if factor >= 1:
            raise ValueError("target_margin must be less than 1")
    return policy, mode, factor, increment


def prepare(quotes_path, current_path, policy_path, output):
    quotes = read_rows(quotes_path)
    existing = read_rows(current_path, current=True) if current_path else {}
    policy, mode, factor, increment = load_policy(policy_path)
    plan = []
    for key, quote in quotes.items():
        old = existing.get(key)
        base = quote["cost"] * factor if mode == "markup" else quote["cost"] / (1 - factor)
        proposed = (base / increment).to_integral_value(rounding=ROUND_CEILING) * increment
        status = "new" if old is None else ("cost_changed" if old["cost"] != quote["cost"] else "unchanged")
        # A stable cost does not authorize repricing a historical item.
        proposed = old["retail"] if status == "unchanged" else proposed
        plan.append({
            **{field: quote[field] for field in KEY_FIELDS},
            "old_cost": decimal_text(old["cost"]) if old else "",
            "new_cost": decimal_text(quote["cost"]),
            "old_retail": decimal_text(old["retail"]) if old else "",
            "proposed_retail": decimal_text(proposed),
            "status": status,
            "requires_review": status != "unchanged",
        })
    if output.exists():
        raise ValueError("Output directory already exists; choose a new batch directory")
    output.mkdir(parents=True)
    fields = list(plan[0])
    with (output / "followup-plan.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in plan:
            safe = {k: ("'" + v if isinstance(v, str) and v.startswith(("=", "+", "-", "@", "\t", "\r")) else v) for k, v in row.items()}
            writer.writerow(safe)
    result = {"mode": "local_review_only", "policy": policy, "rows": plan,
              "counts": {s: sum(row["status"] == s for row in plan) for s in ("new", "cost_changed", "unchanged")}}
    (output / "followup-plan.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (output / "README.txt").write_text(
        "本批仅生成本地审核计划，未修改原表或平台商品。\n"
        "按供应商、供货商品编号、SKU、规格四项精确匹配；未变采购价保留旧售价。\n"
        "CSV 导入表格时，将商品编号和 SKU 列指定为文本，避免长编号精度丢失。\n"
        "定价参数为使用者明确提供的规则，不是平台通用要求。\n", encoding="utf-8")
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--quotes", type=Path, required=True)
    parser.add_argument("--current", type=Path)
    parser.add_argument("--policy", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    try:
        result = prepare(args.quotes, args.current, args.policy, args.out.expanduser().resolve())
    except (ValueError, OSError, KeyError, TypeError) as exc:
        parser.exit(2, f"Error: {exc}\n")
    print(json.dumps({"output": str(args.out.resolve()), "counts": result["counts"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
