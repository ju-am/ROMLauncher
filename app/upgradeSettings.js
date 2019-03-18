const currentSettingsVersion = 1;

function upgradeSettings() {
    
    readSettingsFile();
    readSettingsVersion();
    upradeOldSettings();
    writeUpgradedSettings();
    
}

var oldSettings;
function readSettingsFile() {
    let oldSettingsFile;
    try {
        oldSettingsFile = fs.readFileSync(exePath+'/../settings.json')
    }
    catch (e) {
        console.log("upgrade-settings : settings.json is missing")
    }
    if (typeof oldSettingsFile !== 'undefined') {
        oldSettings = JSON.parse(oldSettingsFile);
    }
}

var oldSettingsVersion;
function readSettingsVersion() {
    if (oldSettings !== undefined) {
        if (oldSettings.hasOwnProperty('general')) {
            if (oldSettings.general.hasOwnProperty('settingsVersion')) {
                oldSettingsVersion = oldSettings.general.settingsVersion;
            }
            else {
                oldSettingsVersion = 0;
            }
        }
        else {
            oldSettingsVersion = 0;
        }
    }
}

var oldSettingsUpgraded = false;
function upradeOldSettings() {
    
    if (oldSettings !== undefined) {
        if (oldSettingsVersion === 0) {
            
            console.log("upgrade-settings : version 0 to version 1");
            // settings.json version 0:
            
            /*
            {
                "systems": [
                    {
                        "tabName": "",
                        "systemId": "",
                        "emuPath": "",
                        "emuArgs": [""],
                        "romPaths": [""],
                        "fileTypes": [""],
                        "gradient": "",
                        "order": ""
                    }
                ]
            }
            */
            
            // upgrade to version 1:
            
            /*
                ->  add general.settingsVersion
            */
            oldSettings.general = new Object();
            oldSettings.general.settingsVersion = 1;
            
            /*
                ->  convert systems[system].romPaths from 
                "romPaths" : [""] 
                ->  to 
                "romPaths" : [{
                    "directory" : "",
                    "recursive" : false
                }]
            */
            oldSettings.systems.forEach(function(systemOptions) {
                let newRomPaths = [];
                systemOptions.romPaths.forEach(function(romPath) {
                    let newRomPathEntry = new Object();
                    newRomPathEntry.directory = romPath;
                    newRomPathEntry.recursive = false;
                    newRomPaths.push(newRomPathEntry);
                });
                systemOptions.romPaths = newRomPaths;
            });
            
            console.log(oldSettings);
            oldSettingsUpgraded = true;
        }
    }
}

function writeUpgradedSettings() {
    if (oldSettingsUpgraded) {
        fs.writeFileSync( exePath+'/../settings.json', JSON.stringify(oldSettings, null, 4), 'utf-8' );
    }
}