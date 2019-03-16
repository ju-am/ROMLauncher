$(document).ready(() => {
    initializeLauncher();
    
    $(".titlebar_control").mouseover(function() {
        $(this).stop();
        $(this).animate({"opacity" : "1.0"}, 200);
    });
    
    $(".titlebar_control").mouseleave(function() {
        $(this).stop();
        $(this).animate({"opacity" : "0.6"}, 200);
    });
    
    //$('#systems').disableSelection();
});


var childProcess = require('child_process');

function launchEmulator(args) {
    console.log(args);

    displayLoadingScreen();

    var emulator = childProcess.exec(args.join(' '), (error, stdout, stderr) => {
        // console.log(emulator.pid);
        if (error) {
            console.log(error.message);
            $('#roms').html("");
            writeError("Failed to launch emulator.");
            writeError("Please review your settings.");
            $('#foreground0').css({'display':'none'});
        }
    });
}

function displayLoadingScreen() {
    $('#foreground0').css({'display':'block'});
    $('#foreground0').css({'opacity':0.5});
    $('#foreground0').css({'background':$('#background'+activeBackground).css('background')});
    setTimeout(function() {
        $('#foreground0').animate({'opacity':0}, 350);
    }, 1500);
    setTimeout(function() {
        $('#foreground0').css({'display':'none'});
    }, 1850);
}

function writeError(message) {
    $('#roms').append('<tr class="rom"><td>'+message+'</td></tr>');
}

$(document).on('click', '.rom', function(){
    let fadeMin = 0.75;
    let fadeMax = 1.0;
    let fadeFreq = 100;
    $(this).stop();
    $(this).fadeTo(fadeFreq, fadeMin).fadeTo(fadeFreq, fadeMax).fadeTo(fadeFreq, fadeMin).fadeTo(fadeFreq, fadeMax);

    let romInfo = $(this).data('rom_info');

    launchEmulator(romInfo.args);
});

$(document).on('click', '#settings_editor_message_close', function() {
    $('#settings_editor_message').css({'display' : 'none'});
});

function showEditorMessage(message, isWarning) {    
    if (isWarning) {
        $('#settings_editor_message').css({'background-color' : '#CF3434'});
    }
    else {
        $('#settings_editor_message').css({'background-color' : '#34cf81'});
    }
    $('#settings_editor_message').css({'display' : 'block'});
    
    $('#settings_editor_message').get(0).childNodes[0].nodeValue = message;
}

$(document).on('click', '#settings_save_system', function() {
    saveDelCurrentSettings(true);
});

$(document).on('click', '#settings_delete_system', function() {
    saveDelCurrentSettings(false);
});

$(document).on('click', '#titlebar_close', function(){
    var window = remote.getCurrentWindow();
    window.close();
});

$(document).on('click', '#titlebar_max', function(){
    var window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
        window.maximize();          
    } else {
        window.unmaximize();
    }
});

$(document).on('click', '#titlebar_min', function(){
    var window = remote.getCurrentWindow();
    window.minimize(); 
});

var editMode = false;
$(document).on('click', '#titlebar_settings', function(){
    if (!editMode) {
        enterSettingsEditor();
    }
    else {
        leaveSettingsEditor();
    }
});

function enterSettingsEditor() {
    $('#roms_wrapper').css({'display':'none'});
    $('#settings_wrapper').css({'display':'grid'});
    $('#titlebar_settings').html('BACK');
    $('#sys_empty').css({'display':'block'});
    changeTitlebarName('Configuration Editor', false);
    editMode = true;
    /*$('#systems').sortable();
    $('#systems').sortable( "option", "disabled", false );
    $('#systems').sortable({ axis: 'y' });*/
    
    // loadSettingsEditor();
}

function leaveSettingsEditor() {
    $('#roms_wrapper').css({'display':'grid'});
    $('#settings_wrapper').css({'display':'none'});
    $('#titlebar_settings').html('EDIT');
    $('#sys_empty').css({'display':'none'});
    changeTitlebarName(bufferedTitlebarName === '' ? 'ROM Launcher' : bufferedTitlebarName, false);
    editMode = false;
    /*$('#systems').sortable('disable');*/
}

$(document).on('click', '.settings_input_add', function(){
    let parent = $(this).parent().clone();
    parent.find('input').val('');
    $(this).parent().parent().append(parent);
});

$(document).on('click', '.settings_input_rem', function(){
    if ($(this).parent().parent().find('input').length >= 2) {
        $(this).parent().remove();
    }
});

function saveDelCurrentSettings(save) {
    try {
        settingsFile = fs.readFileSync(exePath+'/../settings.json')
    }
    catch (e) {
        console.log("FILE NOT FOUND -- settings.json IS MISSING")
    }
    if (typeof settingsFile !== 'undefined') {
        // Found settings, store in settings var
        console.log("LOADING EXISTING settings.json CONFIGURATION")
        settings = JSON.parse(settingsFile);
        console.log("WRITING BACKUP TO settings_backup.json")
        try {
            fs.writeFileSync( exePath+'/../settings_backup.json', JSON.stringify(settings, null, 4), 'utf-8' );
        }
        catch (e) {
            console.log("FAILED TO WRITE settings_backup.json FILE!")
        }
    } else {
        // otherwise, create empty object in setting var
        console.log("CREATING EMPTY settings.json CONFIGURATION")
        settings = new Object();
        settings.systems = [];
    }
    
    // Parse settings to userSettings, current ID to userSettingsId (empty if new system)
    if (!parseUserSettings(save)) {
        return;
    }
    
    // Print new settings for new/ existing system
    console.log(userSettings);
    
    // Write system changes to memory
    if (userSettingsId === '') {
        // New system
        if (save) settings.systems.push(userSettings);
    } else {
        // Changes to existing system
        let systemIndex = settings.systems.findIndex(function(system) {
            return userSettingsId == system.systemId;
        });
        if (save) settings.systems[systemIndex] = userSettings;
        else settings.systems.splice(systemIndex, 1);
    }

    // Write system changes to disk
    try {
        fs.writeFileSync( exePath+'/../settings.json', JSON.stringify(settings, null, 4), 'utf-8' );
    }
    catch(e) {
        console.log("FAILED TO WRITE settings.json FILE!")
    }

    showEditorMessage('Changes saved! You might need to restart the launcher for the changes to take effect.', false);
    
    if (!save) {
        $('.settings_category').each(function() {
            $(this).find('.settings_currently_editing').val('New System');
        });
    }
    
    initializeLauncher();
}

var userSettingsId;
var userSettings;

// Get the changes made to an existing or new system, also give basic user feedback
function parseUserSettings(save) {

    let settingsCurrentlyEditing = $('.settings_currently_editing').val();

    if (settingsCurrentlyEditing === 'New System') {
        userSettingsId = '';
    } else {
        userSettingsId = settingsCurrentlyEditing;
    }
    
    if (!save && settingsCurrentlyEditing === 'New System' || settingsCurrentlyEditing === '') {
        showEditorMessage('Cannot delete new system.', true);
        return false;
    }

    userSettings = new Object();

    let settingsDisplayName = $('.settings_display_name').val();
    
    if (settingsDisplayName === '') {
        showEditorMessage('Launcher prefix may not be empty.', true);
        return false;
    }
    
    userSettings.tabName = settingsDisplayName;

    let settingsUniqueId = $('.settings_unique_id').val();

    if (settingsUniqueId === '') {
        showEditorMessage('Unique ID may not be empty.', true);
        return false;
    } else if (settingsUniqueId === 'New System') {
        showEditorMessage('Unique ID may not be "New System".', true);
        return false;
    } else if (settingsUniqueId.includes(' ')) {
        showEditorMessage('Unique ID may not include spaces.', true);
        return false;
    }
    
    userSettings.systemId = settingsUniqueId;

    let settingsEmuPath = $('.settings_emu_path').val();
    
    /*if (!settingsEmuPath.includes('"')) {
        showEditorMessage('Please wrap all paths in double quotation marks "..."', true);
        return false;
    }
    else if (settingsEmuPath.includes('\\')) {
        showEditorMessage('Emulator path may not include backslashes.', true);
        return false;
    }*/
    if (settingsEmuPath === '') {
        showEditorMessage('Emulator path may not be empty.', true);
        return false;
    }
    
    userSettings.emuPath = settingsEmuPath;
    
    let arrayIndex;
    let returnWithError = ''; // This is a work-around, since return false doesn't work in .each() -- if this is non-empty after .each(), return false
    
    // If we're creating a new system, but specified ID already exists, cancel    
    if (settingsCurrentlyEditing === ('New System')) {
        $('.system').each(function() {
            if ($(this).attr('id') === ('system_'+settingsUniqueId)) {
                returnWithError = 'Cannot create new system - A system with this ID already exists.';
                return false;
            }
        });
    }
    
    arrayIndex = 0;
    let settingsEmuArg = [];
    $('.settings_emu_arg').each(function() {
        let emuArg = $(this).val();
        
        if (emuArg === '') {
            // This isn't an error, just skip loop on empty arguments
            return false;
        }
        
        settingsEmuArg[arrayIndex] = emuArg;
        arrayIndex++;
    });
    
    userSettings.emuArgs = settingsEmuArg;
    
    arrayIndex = 0;
    let settingsRomDir = [];
    $('.settings_rom_dir').each(function() {
        let romDir = $(this).val();
        
        if (!romDir.includes('"')) {
            returnWithError = 'Please wrap all directories in double quotation marks "..."';
            console.log(returnWithError);
            return false;
        }
        /*
        else if (romDir.includes('\\')) {
            returnWithError = 'ROM directories may not include backslashes.';
            return false;
        }*/
        else if (romDir === '') {
            returnWithError = 'ROM directories may not be empty.';
            return false;
        }
        
        settingsRomDir[arrayIndex] = romDir;
        arrayIndex++;
    });
    
    userSettings.romPaths = settingsRomDir;
    
    arrayIndex = 0;
    let settingsFileType = [];
    $('.settings_file_type').each(function() {
        let fileType = $(this).val();
        
        if (fileType.includes('.')) {
            returnWithError = 'Please remove any dots from file-types.';
            return false;
        } else if (fileType === '') {
            returnWithError = 'ROM file-types may not be empty.';
            return false;
        }
        
        settingsFileType[arrayIndex] = fileType;
        arrayIndex++;
    });
    
    userSettings.fileTypes = settingsFileType;
    
    if (returnWithError !== '') {
        showEditorMessage(returnWithError, true);
        return false;
    }
    
    let settingsCssGradient = $('.settings_css_gradient').val();
    
    if (settingsCssGradient.includes(';')) {
        showEditorMessage('Please remove the semicolon from the CSS background value.', true);
        return false;
    } else if (settingsCssGradient === '') {
        settingsCssGradient = "linear-gradient(0deg, rgba(59,58,83,1) 0%, rgba(137,159,163,1) 100%)";
    } else if (settingsCssGradient.includes('background')) {
        showEditorMessage('Please enter only the value in the CSS background field (the text after the colon, exluding the final semicolon).', true);
        return false;
    }
    
    userSettings.gradient = settingsCssGradient;

    let settingsOrder = $('.settings_order').val();
    
    if (isNaN(settingsOrder)) {
        showEditorMessage('Order needs to be a number.', true);
        return false;
    } else if (settingsOrder === '') {
        showEditorMessage('Order may not be empty.', true);
        return false;
    }

    userSettings.order = settingsOrder;
    
    return true;
}

const fs = require('fs');
const path = require ('path');
const app = require('electron');
const remote = app.remote;
const dialog = remote.dialog;

// selectPath : select path (true) or directory (false)
// title : window title
// button : button label
// callback : callback function
function getPathDialog(jQueryElement, selectPath, title, button, callback) {
    dialog.showOpenDialog({
        title : title,
        buttonLabel : button,
        properties: [(selectPath ? 'openFile' : 'openDirectory')],
        filters : [
            { name : 'All Files', extensions : ['*'] }
        ]
    }, (file) => {
        callback(file, jQueryElement);
    });
}

$(document).on('click', '.settings_input_get_directory', function() {
    
    getPathDialog($(this), false, "Select Directory", "Select Directory", function(file, button) {
        console.log(file);
        if (file !== undefined) {
            button.siblings('input').val(formatFilePath(file));
        }
    });
});

$(document).on('click', '.settings_input_get_path', function() {
    
    getPathDialog($(this), true, "Select File", "Select File", function(file, button) {
        console.log(file);
        if (file !== undefined) {
            button.siblings('input').val(formatFilePath(file));
        }
    });
});

$(document).on('click', '.settings_input_make_relative', function() {
    let filePath = $(this).siblings('input').val();
    if (filePath !== '') {
        console.log("Trying to make path relative...");
        console.log(filePath);
        console.log(exePath);
        filePath = path.relative(exePath.toString().replace(/"/g, ''), filePath.toString().replace(/"/g, ''));
        console.log(filePath);
        $(this).siblings('input').val(addSpaces(filePath));
    }
});

function formatFilePath(input) {
    // input = input.toString().replace(/\\/g, '/');
    // anchorPath = exePath.toString().replace(/\\/g, '/');
    return addSpaces(input);
}


function loadSettingsEditor(systemOptions) {

    /*let exeDir = path.dirname(remote.app.getPath('exe'));
    let current = JSON.parse(fs.readFileSync(exeDir+'/../settings.json'));
    if (current) {
        console.log("Settings Editor: Settings file found, now loading...")
        // if (current.hasOwnProperty('systems')) {
    }*/

    // I don't know why I wrote it like this, could probably access the classes directly (with .each(...) for the arrays), ...but whatever
    $('.settings_category').each(function() {
        $(this).find('.settings_currently_editing').val(systemOptions && systemOptions.hasOwnProperty('systemId') ? systemOptions.systemId : 'New System');
        $(this).find('.settings_display_name').val(systemOptions && systemOptions.hasOwnProperty('tabName') ? systemOptions.tabName : '');
        $(this).find('.settings_unique_id').val(systemOptions && systemOptions.hasOwnProperty('systemId') ? systemOptions.systemId : '');
        $(this).find('.settings_emu_path').val(systemOptions && systemOptions.hasOwnProperty('emuPath') ? systemOptions.emuPath : '');
        loadSettingsEditorArrayOption('.settings_emu_arg', systemOptions && systemOptions.hasOwnProperty('emuArgs') ? systemOptions.emuArgs : [], $(this));
        loadSettingsEditorArrayOption('.settings_rom_dir', systemOptions && systemOptions.hasOwnProperty('romPaths') ? systemOptions.romPaths : [], $(this));
        loadSettingsEditorArrayOption('.settings_file_type', systemOptions && systemOptions.hasOwnProperty('fileTypes') ? systemOptions.fileTypes : [], $(this));
        $(this).find('.settings_css_gradient').val(systemOptions && systemOptions.hasOwnProperty('gradient') ? systemOptions.gradient : '');
        $(this).find('.settings_order').val(systemOptions && systemOptions.hasOwnProperty('order') ? systemOptions.order : '0');
    });

}

function loadSettingsEditorArrayOption(inputClass, jsonArray, settingsCategory) {
    var settings_emu_arg_parent = settingsCategory.find(inputClass).parent().parent();
    var settings_emu_arg = settingsCategory.find(inputClass).parent().first().clone();
    settings_emu_arg.find('input').val('');
    settingsCategory.find(inputClass).each(function() {
        $(this).parent().remove();
    });
    for (var i = 0; i < jsonArray.length; ++i) {
        let emu_arg_entry = settings_emu_arg.clone();
        emu_arg_entry.find('input').val(jsonArray[i]);
        settings_emu_arg_parent.append(emu_arg_entry.clone());
    }
    if (jsonArray <= 0) settings_emu_arg_parent.append(settings_emu_arg.clone());
}



$(document).on('click', '.e_add', function(){
    var input = $(this).parent().children('input').first().clone();
    input.val('');
    $(this).parent().append(input);
});

$(document).on('click', '.e_rem', function(){
    if ($(this).parent().children('input').length <= 1) return;
    var input = $(this).parent().children('input').last();
    input.remove();
});

$(document).on('click', '.system', function() {
    
    systemOptions = $(this).data($(this).attr('id'));
    changeSystem(systemOptions);
    
    // if (editMode)
    loadSettingsEditor(systemOptions);
    $('#settings_editor_message').css({'display' : 'none'});
});

$(document).on('click', '#sys_empty', function() {
    loadSettingsEditor(undefined);
});

var activeBackground = 1;
var lastSystem = "";
function changeSystem(systemOptions) {

    // Only proceed if this system wasn't already loaded
    if (lastSystem !== systemOptions.systemId) {
        
        // Reload ROM list
        loadRomList(systemOptions);
        
        // Animate background color
        $('#background'+activeBackground).stop();
        $('#background'+activeBackground).animate({
            'opacity' : 0
        }, 1500);
        if (activeBackground === 1) {
            activeBackground = 2;
        } else if (activeBackground === 2) {
            activeBackground = 1;
        }
        $('#background'+activeBackground).stop();
        $('#background'+activeBackground).css({'background' : systemOptions.gradient})
        $('#background'+activeBackground).animate({
            'opacity' : 1.0
        }, 1500);
        
        // Clear any active searches
        $('#search_bar').val('');
        
        // Fade in ROM display
        $('#roms').css({'opacity' : '0'})
        $('#roms').animate({
           'opacity' : '1.0'
        },200)
        
        if (!editMode) {
            bufferedTitlebarName = changeTitlebarName(systemOptions.tabName, true);
        } else {
            bufferedTitlebarName = systemOptions.tabName + ' Launcher';
        }
        
        lastSystem = systemOptions.systemId;
    }
}

var bufferedTitlebarName = '';
function changeTitlebarName(launcherPrefix, showSuffix) {
    // Change title name to tabName Launcher
    $('#titlebar_name').stop().animate({'opacity':0.0}, 250).animate({'opacity':1.0}, 250);
    var newname = launcherPrefix + (showSuffix ? ' Launcher' : '');
    setTimeout(function() {
        $('#titlebar_name').html(newname);
    }, 250);
    return newname;
}

//const settings = require('./settings.json')

// const settingsFile = fs.readFileSync('./settings.json');
const exePath = path.dirname(remote.app.getPath('exe'));
var settingsFile;
var settings;
// console.log(exePath);

function initializeLauncher() {
    try {
        settingsFile = fs.readFileSync(exePath+'/../settings.json')
    }
    catch (e) {
        console.log("FILE NOT FOUND settings.ini IS MISSING")
    }
    
    if (typeof settingsFile !== 'undefined') {
        settings = JSON.parse(settingsFile);
    }
    
    $('#systems').html('');
    if (typeof settings !== 'undefined') {
        settings.systems.forEach(function(systemOptions) {
            // var iconPath = exePath.replace(/\\/g, '/');
            // iconPath = iconPath.replace(/"/g, '');
            // iconPath = iconPath + '/../icons/' + systemOptions.systemId + '.png';
            var iconPath = './../../../icons/' + systemOptions.systemId + '.png';
            
            // console.log(iconPath);
            
            $('#systems').append('<div id="system_'+systemOptions.systemId+'" class="system"><img class="system_icon" src="'+iconPath+'" /></div>');
            $('#system_'+systemOptions.systemId).data('system_'+systemOptions.systemId, systemOptions);
        });
    }
    // $('#systems').append('<div id="sys_empty"><img class="system_icon" src=./img/add_sys.png /></div>');
    $('#systems').append('<div id="sys_empty"><img class="system_icon" src=./img/add_sys.png /></div>');
    
    // Re-order system elements according to their order value
    var previous;
    var previousOrder;
    var current;
    var currentOrder;
    $('.system').each(function() {
        previous = $(this);
        previousOrder = $(this).data($(this).attr('id')).order;
        $('.system').each(function() {
            current = $(this);
            currentOrder = $(this).data($(this).attr('id')).order;
            if (parseInt(currentOrder) < parseInt(previousOrder)) {
                $(this).detach().insertBefore(previous);
            }
        });
    });
    
    if (editMode) {
        // leaveSettingsEditor();
        $('#sys_empty').css({'display':'block'});
    }
}

function loadRomList(systemOptions) {
    
    // Wipe ROM display
    $('#roms').html('');

    // sync read roms from rom-paths
    for (const path of systemOptions.romPaths) {
        romPath = path.replace(/\\/g, '/');
        romPath = romPath.replace(/"/g, '');
        fs.readdir(romPath, readDirectory);
    }
}

var romPath;
function readDirectory(err, files) {
    
    // On failure
    if (err) {
        $('#roms').html('');
        writeError("Failed to read ROM directory:");
        writeError(romPath);
        if (romPath.includes('\\')) {
            writeError("Please use forward-slashes only.");
        } else {
            writeError("Please review your settings file.");
        }
        return;
    }

    files.forEach(file => {
        systemOptions.fileTypes.forEach(function(fileType) {
            if (file.toLowerCase().includes('.'+fileType.toLowerCase())) {
                
                var romInfo = new Object();
                
                // remove file extension
                romInfo.displayName = file.slice(0, -(fileType.length+1));
                romInfo.args = [];
                
                // add arguments to args array, replace ROM-file placeholder, add quotes where needed
                romInfo.args.push(addSpaces(systemOptions.emuPath));
                systemOptions.emuArgs.forEach(function(arg){
                    if (arg === '%ROMFILE%') {
                        arg = addSpaces(romPath+'/'+file);
                    }
                    romInfo.args.push(arg);
                });
                // if args is still empty, push only ROM-file
                if (systemOptions.emuArgs.length === 0) {
                    romInfo.args.push(addSpaces(romPath+'/'+file));
                }

                // playlist styling
                if (fileType === "m3u") {
                    romInfo.displayName = "&#8251; " + romInfo.displayName + " (Playlist)";
                }

                let entry = $('<tr class="rom"><td>'+romInfo.displayName+'</td></tr>');
                entry.data('rom_info', romInfo);
                $('#roms').append(entry);
            } 
        });
    });
}

function addSpaces(path) {

    if (path.includes('\"')) {
        return path;
    }
    else {
        path = '"'+path+'"';
    }
    return path;

}

function filterRomList() {
    let query = $('#search_bar').val();
    $('.rom').each(function() {
        let name = $(this).html();
        if (!name.toLowerCase().includes(query.toLowerCase())) {
            $(this).css({'display' : 'none'});
        } else {
            $(this).css({'display' : ''});
        }
    });
}

function blurElement(element, size, time) {
    var filterVal = 'blur(' + size + 'px)';
    $(element).css({
        'filter':filterVal,
        'webkitFilter':filterVal,
        'mozFilter':filterVal,
        'oFilter':filterVal,
        'msFilter':filterVal,
        'transition':'all '+time+'s ease-out',
        '-webkit-transition':'all '+time+'s ease-out',
        '-moz-transition':'all '+time+'s ease-out',
        '-o-transition':'all '+time+'s ease-out'
    });
}