import { existsSync } from "node:fs";
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("png");
const browser = process.env.REMOTION_BROWSER_EXECUTABLE;
if (browser) {
  if (!existsSync(browser)) throw new Error("REMOTION_BROWSER_EXECUTABLE does not exist");
  Config.setBrowserExecutable(browser);
}
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
