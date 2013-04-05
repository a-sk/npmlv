* move package.json updater code to a separate module
* when updating package.json try not to reformat code.
  Right now we only detect indention level and character
* if module is found in devDependencies, do not include into
  dependencies
