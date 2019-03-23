$(document).ready(() => {
    
    // Upgrade settings file to latest version
    upgradeSettings();
    
    // Load settings, systems, configuration editor
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


var spawn = require('child_process').spawn;
var emulator;

function launchEmulator(romInfo) {
    // emulator
    // args
    // cwd
    
    let spawnEmulator = '';
    
    let addedEmulator = false;
    try {
        let stat = fs.statSync(romInfo.emulator.replace(/"/g, ''));
        if (stat.isFile()) {
            console.log('launch-emulator : resolved emulator path...');
            spawnEmulator = path.resolve(romInfo.emulator.replace(/"/g, ''));
            addedEmulator = true;
        }
    } catch(e) {
        // errors here are expected whenever a non-path emulator command is given
    }
    if (!addedEmulator) {
        console.log('launch-emulator : failed to resolve emulator path, add as command instead...');
        spawnEmulator = romInfo.emulator.replace(/"/g, '');
    }
    console.log('launch-emulator : emulator path ' + spawnEmulator);
    
    let spawnArgs = [];
    
    for (var i = 0; i < romInfo.args.length; ++i) {
        let added = false;
        try {
            let stat = fs.statSync(romInfo.args[i].replace(/"/g, ''));
            if (stat.isFile()) {
                console.log('launch-emulator : convert emulator argument file path...');
                spawnArgs.push(path.resolve(romInfo.args[i].replace(/"/g, '')));
                console.log('launch-emulator : converted to ' + spawnArgs[i]);
                added = true;
            }
            if (stat.isDirectory()) {
                console.log('launch-emulator : convert emulator argument directory...');
                spawnArgs.push(path.resolve(romInfo.args[i].replace(/"/g, '')));
                console.log('launch-emulator : converted to ' + spawnArgs[i]);
                added = true;
            }
        }
        catch(e) {
            // errors here are expected whenever a non-path/directory argument is given, just ignore it
        }
        if (!added) {
            spawnArgs.push(romInfo.args[i]);
        }
    }
    
    console.log('launch-emulator : try running ' + spawnEmulator + ' ' + spawnArgs.join());

    displayLoadingScreen();
    emulator = spawn(spawnEmulator, spawnArgs);
    emulator.on('error', onEmulatorError);
}

function onEmulatorError(err) {
    showRomListError("Failed to launch emulator. Please review your settings.");
    $('#foreground0').css({'display':'none'});
    console.log('on-emulator-error : ' + err);
}

function killEmulator() {
    if (emulator) {
        console.log('kill-emulator : attempting to kill emulator');
        emulator.kill();
    }
}

function showRomListError(message) {
    $('#roms_wrapper').css({
        'grid-auto-rows' : 'min-content minmax(1px, 1fr) 42px'
    });
    $('#roms_error_message').css({
        'display' : 'block'
    })
    $('#roms_error_message').get(0).childNodes[0].nodeValue = message;
}

$(document).on('click', '#roms_error_message_close', function() {
    hideRomListError();
});

function hideRomListError() {
    $('#roms_wrapper').css({
        'grid-auto-rows' : 'minmax(1px, 1fr) 42px'
    });
    $('#roms_error_message').css({
        'display' : 'none'
    })
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
    launchEmulatorFromRomList($(this));
});

function onGamepadConfirmOverRom(element) {
    launchEmulatorFromRomList(element);
}

function launchEmulatorFromRomList(element) {
    let fadeMin = 0.75;
    let fadeMax = 1.0;
    let fadeFreq = 100;
    element.stop();
    element.fadeTo(fadeFreq, fadeMin).fadeTo(fadeFreq, fadeMax).fadeTo(fadeFreq, fadeMin).fadeTo(fadeFreq, fadeMax);
    let romInfo = element.data('rom_info');
    launchEmulator(romInfo);
}

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

$(document).on('click', '.settings_css_gradient_preset', function() {
    $(this).parent().siblings('input').val($(this).attr('style').replace('background: ', '').replace(';', ''));
});

$(document).on('click', '#display_system_settings', function() {
    if ($(this).hasClass('settings_tab_blur')) {
        $('#display_general_settings').addClass('settings_tab_blur');
        $(this).removeClass('settings_tab_blur');
        
        $('#general_editor').css({'display' : 'none'});
        $('#settings_editor').css({'display' : 'block'});
        
        let editorMessage = $('#settings_editor_message');
        editorMessage.css({'display' : 'none'});
        editorMessage.detach();
        $('#settings_system_save_options').before(editorMessage);
    }
});

$(document).on('click', '#display_general_settings', function() {
    if ($(this).hasClass('settings_tab_blur')) {
        $('#display_system_settings').addClass('settings_tab_blur');
        $(this).removeClass('settings_tab_blur');
        
        $('#general_editor').css({'display' : 'block'});
        $('#settings_editor').css({'display' : 'none'});
        
        let editorMessage = $('#settings_editor_message');
        editorMessage.css({'display' : 'none'});
        editorMessage.detach();
        $('#settings_general_save_options').before(editorMessage);
    }
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


$(document).on('click', '.settings_checkbox', function() {
    if ($(this).text() === '') {
        $(this).text('✓');
    }
    else {
        $(this).text('');
    }
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

    // if this is the rom directory input, reset recursive option to default
    if (parent.find('.settings_input_directory_recursive')) {
        parent.find('.settings_input_directory_recursive').text(recursive_off);
        parent.find('.settings_input_directory_recursive').attr('title', recursive_off_title);
    }

    $(this).parent().parent().append(parent);
});

$(document).on('click', '.settings_input_rem', function(){
    if ($(this).parent().parent().find('input').length >= 2) {
        $(this).parent().remove();
    }
    // if this is the last input line, don't delete element, but value instead    
    else {
        $(this).parent().parent().find('input').val('');
    }
});

function saveDelCurrentSettings(save) {
    try {
        settingsFile = fs.readFileSync(exePath+'/../settings.json')
    }
    catch (e) {
        console.log("save-del-settings : couldn't load settings.json!")
    }
    if (typeof settingsFile !== 'undefined') {
        // Found settings, store in settings var
        console.log("save-del-settings : load existing settings.json")
        settings = JSON.parse(settingsFile);
        console.log("save-del-settings : write backup to settings_backup.json")
        try {
            fs.writeFileSync( exePath+'/../settings_backup.json', JSON.stringify(settings, null, 4), 'utf-8' );
        }
        catch (e) {
            console.log("save-del-settings : failed to write backup file!")
        }
    } else {
        // otherwise, create empty object in setting var
        console.log("save-del-settings : creating new empty configuration")
        settings = new Object();
        settings.general = {};
        settings.general.settingsVersion = currentSettingsVersion;
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
        console.log("save-del-settings : failed to write to settings.json")
    }

    showEditorMessage('Changes saved! You might need to restart the launcher for the changes to take effect.', false);
    
    if (!save) {
        $('.settings_currently_editing').val('New System');
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
        let romDirRecursive = $(this).siblings('.settings_input_directory_recursive').text() === recursive_off ? false : true;
        
        if (romDir === '') {
            returnWithError = 'ROM directories may not be empty.';
            return false;
        }
        else if (!romDir.includes('"')) {
            returnWithError = 'Please wrap all directories in double quotation marks "..."';
            console.log(returnWithError);
            return false;
        }
        
        let romDirOptions = new Object();
        romDirOptions.directory = romDir;
        romDirOptions.recursive = romDirRecursive;
        
        settingsRomDir[arrayIndex] = romDirOptions;
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

$(document).on('click', '#settings_save_general', function() {
    saveGeneralSettings();
});

function saveGeneralSettings() {
    try {
        settingsFile = fs.readFileSync(exePath+'/../settings.json')
    }
    catch (e) {
        console.log("save-general-settings : couldn't load settings.json!")
    }
    if (typeof settingsFile !== 'undefined') {
        // Found settings, store in settings var
        console.log("save-general-settings : load existing settings.json")
        settings = JSON.parse(settingsFile);
        console.log("save-general-settings : write backup to settings_backup.json")
        try {
            fs.writeFileSync( exePath+'/../settings_backup.json', JSON.stringify(settings, null, 4), 'utf-8' );
        }
        catch (e) {
            console.log("save-general-settings : failed to write backup file!")
        }
    } else {
        // otherwise, create empty object in setting var
        console.log("save-general-settings : creating new empty configuration")
        settings = new Object();
        settings.general = {};
        settings.general.settingsVersion = currentSettingsVersion;
        settings.systems = [];
    }
    
    // Parse general options here
    if ($('.settings_controller_enabled').text() !== '') {
        settings.general.controllerEnabled = true;
    } else {
        settings.general.controllerEnabled = false;
    }
    if ($('.settings_controller_forcequit').text() !== '') {
        settings.general.controllerForceQuit = true;
    } else {
        settings.general.controllerForceQuit = false;
    }
    settings.general.buttonMapping = [];
    $('.controller_mapping').each(function() {
        settings.general.buttonMapping.push($(this).val().toString());
    });
    

    // Write system changes to disk
    try {
        fs.writeFileSync( exePath+'/../settings.json', JSON.stringify(settings, null, 4), 'utf-8' );
    }
    catch(e) {
        console.log("save-general-settings : failed to write to settings.json")
    }

    showEditorMessage('Changes saved! Restart the launcher for the changes to take effect.', false);
}

function loadGeneralSettings() {
    try {
        settingsFile = fs.readFileSync(exePath+'/../settings.json')
    }
    catch (e) {
        console.log("load-general-settings : couldn't load settings.json!")
        return;
    }
    if (typeof settingsFile !== 'undefined') {
        // Found settings, store in settings var
        console.log("load-general-settings : load existing settings.json")
        settings = JSON.parse(settingsFile);
    }
    
    if (settings.hasOwnProperty('general')) {
        if (settings.general.hasOwnProperty('controllerEnabled')) {
            $('.settings_controller_enabled').text(settings.general.controllerEnabled ? '✓' : '');
            // Enable controller input
            controllerInputEnabled = settings.general.controllerEnabled;
        }
        if (settings.general.hasOwnProperty('controllerForceQuit')) {
            $('.settings_controller_forcequit').text(settings.general.controllerForceQuit ? '✓' : '');
            // Enable controller force quit
            controllerForceQuit = settings.general.controllerForceQuit;
        }
        let mappingIndex = 0;
        if (settings.general.hasOwnProperty('buttonMapping')) {
            
            settings.general.buttonMapping.forEach(function(value) {
                let buttonValue = parseInt(value);
                if (!isNaN(buttonValue)) {
                    $('.controller_mapping').eq(mappingIndex).val(buttonValue);
                    
                    switch(mappingIndex) {
                        case 0:
                        gpUpButton = buttonValue;
                        break;
                        case 1:
                        gpDownButton = buttonValue;
                        break;
                        case 2:
                        gpLeftButton = buttonValue;
                        break;
                        case 3:
                        gpRightButton = buttonValue;
                        break;
                        case 4:
                        gpAButton = buttonValue;
                        break;
                        case 5:
                        gpBButton = buttonValue;
                        break;
                        case 6:
                        gpLButton = buttonValue;
                        break;
                        case 7:
                        gpRButton = buttonValue;
                        break;
                        case 8:
                        forceQuitButtons.push(buttonValue);
                        break;
                        case 9:
                        forceQuitButtons.push(buttonValue);
                        break;
                        case 10:
                        forceQuitButtons.push(buttonValue);
                        break;
                        case 11:
                        forceQuitButtons.push(buttonValue);
                        break;
                        default:
                        break;
                    }
                }
                mappingIndex++;
            });
        }
    }
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

const recursive_off = '🌜'; // emojis in code
const recursive_off_title = "Half: Include Only This Folder (Default)";
const recursive_on = '🌝'; // looks about right, let's hope this doesn't break
const recursive_on_title = "Full: Include All Subdirectories";
$(document).on('click', '.settings_input_directory_recursive', function() {
    if ($(this).text() === recursive_off) {
        $(this).text(recursive_on);
        $(this).attr('title', recursive_on_title);
    }
    else {
        $(this).text(recursive_off);
        $(this).attr('title', recursive_off_title);
    }
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

// Load settings from settings.json systems entry
function loadSettingsEditor(systemOptions) {
    
    let arrayIndex;
    
    let currentlyEditing = systemOptions && systemOptions.hasOwnProperty('systemId') ? systemOptions.systemId : 'New System';
    $('.settings_currently_editing').val(currentlyEditing);
    
    let displayName = systemOptions && systemOptions.hasOwnProperty('tabName') ? systemOptions.tabName : '';
    $('.settings_display_name').val(displayName);
    
    let uniqueId = systemOptions && systemOptions.hasOwnProperty('systemId') ? systemOptions.systemId : '';
    $('.settings_unique_id').val(uniqueId);
    
    let emuPath = systemOptions && systemOptions.hasOwnProperty('emuPath') ? systemOptions.emuPath : '';
    $('.settings_emu_path').val(emuPath);
    
    let emuArgs = systemOptions && systemOptions.hasOwnProperty('emuArgs') ? systemOptions.emuArgs : undefined;
    if (emuArgs !== undefined) {
        loadSettingsEditorEmptyInputRows('.settings_emu_arg', emuArgs.length);
        arrayIndex = 0;
        $('.settings_emu_arg').each(function() {
            $(this).val(emuArgs[arrayIndex]);
            arrayIndex++;
        });
    } else {
        loadSettingsEditorEmptyInputRows('.settings_emu_arg', 1);
    }
    
    let romPaths = systemOptions && systemOptions.hasOwnProperty('romPaths') ? systemOptions.romPaths : undefined;
    if (romPaths !== undefined) {
        loadSettingsEditorEmptyInputRows('.settings_rom_dir', romPaths.length);
        arrayIndex = 0;
        $('.settings_rom_dir').each(function() {
            $(this).val(romPaths[arrayIndex].directory);
            $(this).siblings('.settings_input_directory_recursive').text(romPaths[arrayIndex].recursive ? recursive_on : recursive_off);
            $(this).siblings('.settings_input_directory_recursive').attr('title', romPaths[arrayIndex].recursive ? recursive_on_title : recursive_off_title);
            arrayIndex++;
        });
    } else {
        loadSettingsEditorEmptyInputRows('.settings_rom_dir', 1);
        $('.settings_rom_dir').each(function() {
            $(this).siblings('.settings_input_directory_recursive').text(recursive_off);
            $(this).siblings('.settings_input_directory_recursive').attr('title', recursive_off_title);
        });
    }
    
    let fileTypes = systemOptions && systemOptions.hasOwnProperty('fileTypes') ? systemOptions.fileTypes : undefined;
    if (fileTypes !== undefined) {
        loadSettingsEditorEmptyInputRows('.settings_file_type', fileTypes.length);
        arrayIndex = 0;
        $('.settings_file_type').each(function() {
            $(this).val(fileTypes[arrayIndex]);
            arrayIndex++;
        });
    } else {
        loadSettingsEditorEmptyInputRows('.settings_file_type', 1);
    }
    
    let gradient = systemOptions && systemOptions.hasOwnProperty('gradient') ? systemOptions.gradient : '';
    $('.settings_css_gradient').val(gradient);
    
    let order = systemOptions && systemOptions.hasOwnProperty('order') ? systemOptions.order : '0';
    $('.settings_order').val(order);
}

// Load empty input rows for certain array settings (rom directories, file types, etc.)
function loadSettingsEditorEmptyInputRows(inputClass, inputRowCount) {
    if (inputRowCount == 0) inputRowCount = 1;
    let container = $(inputClass).parent().parent();
    let inputLine = $(inputClass).parent().first().clone()
    inputLine.find('input').val('');
    container.html('');
    for (let i = 0; i < inputRowCount; ++i) {
        container.append(inputLine.clone());
    }
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
    changeSystemFromSystemsList($(this));
});

function changeSystemFromSystemsList(element) {
    systemOptions = element.data(element.attr('id'));
    changeSystem(systemOptions);
    loadSettingsEditor(systemOptions);
    $('#settings_editor_message').css({'display' : 'none'});
}

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
        // Sort ROM list
        sortRomList();
        
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
        console.log("initialize-launcher : couldn't load settings.json!")
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
            
            $('#systems').append('<div id="system_'+systemOptions.systemId+'" class="system" tabindex="1"><img class="system_icon" src="'+iconPath+'" /></div>');
            $('#system_'+systemOptions.systemId).data('system_'+systemOptions.systemId, systemOptions);
        });
    }
    // $('#systems').append('<div id="sys_empty"><img class="system_icon" src=./img/add_sys.png /></div>');
    $('#systems').append('<div id="sys_empty"><img class="system_icon" src=./img/add_sys.png /></div>');
    
    sortSystemList();
    
    if (editMode) {
        // leaveSettingsEditor();
        $('#sys_empty').css({'display':'block'});
    } else {
        loadSettingsEditor(undefined);
        loadGeneralSettings();
    }
}

function loadRomList(systemOptions) {

    // wipe ROM display
    $('#roms').html('');

    // sync read roms from rom-paths
    systemOptions.romPaths.forEach(function(pathOptions) {
        
        romPath = pathOptions.directory.replace(/\\/g, '/');
        romPath = romPath.replace(/"/g, '');
        
        try {
            let files = readDirectory(romPath, systemOptions.fileTypes, pathOptions.recursive);
            files.forEach(function(file) {
                appendRomToList(systemOptions, file);
            });
        }
        catch(e) {
            console.log(e);
            showRomListError("Failed to read ROM directory:\n" + romPath + "\nPlease review your settings file.")
        }

    });
}

var romPath;

function readDirectory(dir, fileTypes, recursive) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory() && recursive) {
            // recursion
            results = results.concat(readDirectory(file, fileTypes, recursive));
        } else {
            // filter current file, add to results if valid
            let fileType = file.split(".").pop();
            fileTypes.forEach(function(fileTypeFilter) {
                if (fileType.toLowerCase() === fileTypeFilter.toLowerCase()) {
                    results.push(file);
                    return false;
                }
            });
        }
    });
    console.log('read-directory : loaded ' + results.length + ' files to list');
    return results;
}

function appendRomToList(systemOptions, file) {

    // file type without punctuation
    let fileType = file.split(".").pop();
    // file name with extension
    let fullFileName = file.split(/(\\|\/)/g).pop();
    // file name without extension
    let fileName = fullFileName.slice(0, -(fileType.length+1));

    var romInfo = new Object();    
    romInfo.displayName = fileName;
    romInfo.emulator = addSpaces(systemOptions.emuPath);
    romInfo.cwd = addSpaces(systemOptions.emuPath.replace(systemOptions.emuPath.split(/(\\|\/)/g).pop(), ''));
    romInfo.args = [];
    systemOptions.emuArgs.forEach(function(arg){
        if (arg === '%ROMFILE%') {
            arg = addSpaces(file);
        }
        romInfo.args.push(arg);
    });
    // if args is still empty, push only ROM-file
    if (systemOptions.emuArgs.length === 0) {
        romInfo.args.push(addSpaces(file));
    }

    // playlist styling
    if (fileType === "m3u") {
        // romInfo.displayName = "&#8251; " + romInfo.displayName + " (Playlist)";
        romInfo.displayName = romInfo.displayName + " (Playlist)";
    }

    let entry = $('<tr class="rom" tabindex="1"><td>'+romInfo.displayName+'</td></tr>');
    entry.data('rom_info', romInfo);
    $('#roms').append(entry);
}


function addSpaces(path) {

    if (path.toString().charAt(0) !== '"') {
        path = '"'+path;
    }
    if (path.toString().charAt(path.length-1) !== '"') {
        path = path+'"';
    }
    return path;
}

function sortRomList() {
    $('.rom').sort(function(a, b) {
      if (a.textContent < b.textContent) {
        return -1;
      } else {
        return 1;
      }
    }).appendTo('#roms');
    // console.log("Sorted ROM list.");
}

function sortSystemList() {
    $('.system').sort(function(a, b) {
      if (parseFloat($(a).data($(a).attr('id')).order) < parseFloat($(b).data($(b).attr('id')).order)) {
        return -1;
      } else {
        return 1;
      }
    }).appendTo('#systems');
    // console.log("Sorted system list.");
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

var shell = require('electron').shell;

$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
});