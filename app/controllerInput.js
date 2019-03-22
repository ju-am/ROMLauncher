var controllerInputEnabled = false;
var controllerForceQuit = false;

// default x-input button mappings for emulator force quit
var forceQuitButtons = [];

// default x-input button mappings
var gpUpButton = 12;
var gpDownButton = 13;
var gpLeftButton = 14;
var gpRightButton = 15;
var gpAButton = 0;
var gpBButton = 1;
var gpLButton = 4;
var gpRButton = 5;

var gpUpButtonFrames = -1;
var gpDownButtonFrames = -1;
var gpLeftButtonFrames = -1;
var gpRightButtonFrames = -1;
var gpAButtonFrames = -1;
var gpBButtonFrames = -1;
var gpLButtonFrames = -1;
var gpRButtonFrames = -1;

window.addEventListener("gamepadconnected", (event) => {
  console.log("Gamepad connected.");
  console.log(event.gamepad);
});

window.addEventListener("gamepaddisconnected", (event) => {
  console.log("Gamepad disconnected.");
  console.log(event.gamepad);
});

var gamepad;
var windowRaf = window.requestAnimationFrame;

windowRaf(controllerUpdate);
function controllerUpdate() {
    
    gamepad = navigator.getGamepads()[0];
    
    if (gamepad !== null && controllerInputEnabled) {
        if (!controllerStyle) enableControllerStyle();

        // Force quit : Step 1 -> Create an array with booleans for every button required to force quit
        let forceQuitCheck = [];
        if (controllerForceQuit) {
            forceQuitButtons.forEach(function() {
                forceQuitCheck.push(false);
            });
        }

        gamepad.buttons.forEach((button, index) => {
            
            if (button.pressed) {
                
                // Force Quit : Step 2 -> For every required button pressed, set the corresponding check flag true
                if (controllerForceQuit) {
                    for (let i = 0; i < forceQuitButtons.length; ++i) {
                        if (index === forceQuitButtons[i]) {
                            forceQuitCheck[i] = true;
                        }
                    }
                }
                
                // Button Mapping : Set value if current element is button mapping input
                if ($(document.activeElement).hasClass('controller_mapping')) {
                    let alreadyMapped = false;
                    $('.controller_mapping').each(function() {
                        if ($(this).val().toString() === index.toString()) {
                            alreadyMapped = true;
                        }
                    });
                    if (!alreadyMapped) {
                        $(document.activeElement).val(index);
                        $(document.activeElement).next().focus();
                    }
                }
                
                if (index === gpUpButton && controllerInputFocus) {
                    gpUpButtonFrames++;
                    if (gpUpButtonFrames < 60) {
                        if (gpUpButtonFrames % 30 === 0) focusPrevious(true);
                    }
                    else if (gpUpButtonFrames < 180) {
                        if (gpUpButtonFrames % 10 === 0) focusPrevious(false);
                    }
                    else if (gpUpButtonFrames < 360) {
                        if (gpUpButtonFrames % 3 === 0) focusPrevious(false);
                    }
                    else focusPrevious(false);
                }
                else if  (index === gpDownButton && controllerInputFocus) {
                    gpDownButtonFrames++;
                    if (gpDownButtonFrames < 60) {
                        if (gpDownButtonFrames % 30 === 0) focusNext(true);
                    }
                    else if (gpDownButtonFrames < 180) {
                        if (gpDownButtonFrames % 10 === 0) focusNext(false);
                    }
                    else if (gpDownButtonFrames < 360) {
                        if (gpDownButtonFrames % 3 === 0) focusNext(false);
                    }
                    else focusNext(false);
                }
                else if (index === gpLeftButton && controllerInputFocus) {
                    gpLeftButtonFrames++;
                    if (gpLeftButtonFrames === 0) focusSystem();
                }
                else if (index === gpRightButton && controllerInputFocus) {
                    gpRightButtonFrames++;
                    if (gpRightButtonFrames === 0) focusRomList();
                }
                else if (index === gpAButton && controllerInputFocus) {
                    gpAButtonFrames++;
                    if (gpAButtonFrames === 0) {
                        
                        // Launch emulator if ROM is selected
                        if ($(document.activeElement).hasClass('rom')) {
                            onGamepadConfirmOverRom($(document.activeElement));
                        }
                        // Load and go to to ROM list if system list is currently active
                        else if ($(document.activeElement).hasClass('system')) {
                            changeSystemFromSystemsList($(document.activeElement));
                            focusRomList();
                        }
                    }
                }
                else if (index === gpBButton && controllerInputFocus) {
                    gpBButtonFrames++;
                    if (gpBButtonFrames === 0) {
                        
                        // Go back to system list if ROM is selected
                        if ($(document.activeElement).hasClass('rom')) {
                            focusSystem();
                        }
                    }
                }
                else if (index === gpLButton && controllerInputFocus) {
                    gpLButtonFrames++;
                    if (gpLButtonFrames === 0) {
                        skipBack();
                    }
                }
                else if (index === gpRButton && controllerInputFocus) {
                    gpRButtonFrames++;
                    if (gpRButtonFrames === 0) {
                        skipForward();
                    }
                }
            }
            
            if (!button.pressed) {
                if (index === gpUpButton) {
                    if (gpUpButtonFrames > -1) gpUpButtonFrames = -1;
                }
                else if (index === gpDownButton) {
                    if (gpDownButtonFrames > -1) gpDownButtonFrames = -1;
                }
                else if (index === gpLeftButton) {
                    if (gpLeftButtonFrames > -1) gpLeftButtonFrames = -1;
                }
                else if (index === gpRightButton) {
                    if (gpRightButtonFrames > -1) gpRightButtonFrames = -1;
                }
                else if (index === gpAButton) {
                    if (gpAButtonFrames > -1) gpAButtonFrames = -1;
                }
                else if (index === gpBButton) {
                    if (gpBButtonFrames > -1) gpBButtonFrames = -1;
                }
                else if (index === gpLButton) {
                    if (gpLButtonFrames > -1) gpLButtonFrames = -1;
                }
                else if (index === gpRButton) {
                    if (gpRButtonFrames > -1) gpRButtonFrames = -1;
                }
            }
        })
        
        // Force Quit : Final Step 3 -> Check the forceQuitCheckArray - If all true, quit emulator
        if (controllerForceQuit) {
            let forceQuitEmulator = true;
            for (let i = 0; i < forceQuitButtons.length; ++i) {
                if (forceQuitCheck[i] === false) {
                    forceQuitEmulator = false;
                }
            }
            if (forceQuitEmulator) {
                if (forceQuitButtons.length > 1) {
                    killEmulator();
                }
            }
        }

        /*
        gamepad.axes.forEach((axe, index) => {
            if (axe != 0){
                
            }
        })
        */

    } else {
        if (controllerStyle) disableControllerStyle();
    }
    windowRaf(controllerUpdate);
}

function clearControllerMapping() {
    $('.controller_mapping').each(function() {
        $(this).val('');
    });
}

var controllerInputFocus = true;

function controllerInputBlurred() {
    controllerInputFocus = false;
}

function controllerInputFocused() {
    controllerInputFocus = true;
}

var lastSystemSelected = null;
var lastRomSelected = null;

function focusSystem() {
    if (editMode) return;
    if ($(document.activeElement).hasClass('rom')) {
        lastRomSelected = $(document.activeElement);
        if (lastSystemSelected !== null) {
            lastSystemSelected.focus();
        } else {
            $('.system').first().focus();
        }
    }
}

function focusRomList() {
    if (editMode) return;
    if ($(document.activeElement).hasClass('system')) {
        lastSystemSelected = $(document.activeElement);
        if (lastRomSelected !== null) {
            lastRomSelected.focus();
            if ($(document.activeElement).hasClass('system')) {
                $('.rom').first().focus();
            }
        } else {
            if ($('.rom').first().length > 0) $('.rom').first().focus();
        }
    }
}

function focusNext(smooth) {
    if (editMode) return;
    $(document.activeElement).next().focus();
    document.activeElement.scrollIntoView({
        behavior: (smooth ? 'smooth' : 'auto'),
        block: 'center',
        inline: 'center'
    });
}

function focusPrevious(smooth) {
    if (editMode) return;
    $(document.activeElement).prev().focus();
    document.activeElement.scrollIntoView({
        behavior: (smooth ? 'smooth' : 'auto'),
        block: 'center',
        inline: 'center'
    });
}

function skipForward() {
    if (editMode) return;
    if ($(document.activeElement).hasClass('rom')) {
        let firstLetter = $(document.activeElement).text().charAt(0);
        $('.rom').each(function() {
            if ($(this).text().charAt(0) > firstLetter) {
                $(this).focus();
                return false;
            }
        });
    }
}

function skipBack() {
    if (editMode) return;
    if ($(document.activeElement).hasClass('rom')) {
        let firstLetter = $(document.activeElement).text().charAt(0);
        $($('.rom').get().reverse()).each(function() {
            if ($(this).text().charAt(0) < firstLetter) {
                $(this).focus();
                return false;
            }
        });
    }
}

var controllerStyle = false;

function enableControllerStyle() {
    console.log("controller-input : controller style enabled");
    $('link[href="./controllerInput.css"]').prop('disabled', false);
    controllerStyle = true;
    if (!$(document.activeElement).hasClass('system') && !$(document.activeElement).hasClass('rom')) {
        if (!editMode) $('.system').first().focus();
        // console.log($(document.activeElement));
    }
}

function disableControllerStyle() {
    console.log("controller-input : controller style disabled");
    $('link[href="./controllerInput.css"]').prop('disabled', true);
    controllerStyle = false;
}