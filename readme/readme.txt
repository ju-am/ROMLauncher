--------------------------------------------------------------------------------
ROM Launcher--------------------------------------------------------------------
https://github.com/ButcheredGenre/ROMLauncher-----------------------------------
--------------------------------------------------------------------------------

TOC
>---CHANGELOG
>---SETUP
>---INITIAL CONFIGURATION
>---(SLIGHTLY) ADVANCED CONFIGURATION
>---IN CASE OF ERROR
>---MISSING OR INCORRECT IMAGES
>---LINUX VERSION
>---KNOWN ISSUES
>---CONTACT / TROUBLESHOOTING

--------------------------------------------------------------------------------
CHANGELOG-----------------------------------------------------------------------
--------------------------------------------------------------------------------

    https://github.com/ButcheredGenre/ROMLauncher

--------------------------------------------------------------------------------
SETUP---------------------------------------------------------------------------
--------------------------------------------------------------------------------

Place this folder anywhere you like. If you want to use relative paths, you
should place this folder near your emulators. The ROM Launcher executable is in
the /bin/ folder (launcher.exe). A settings file (if not already created) will
be created in this (the executable's parent) directory.

--------------------------------------------------------------------------------
INITIAL CONFIGURATION-----------------------------------------------------------
--------------------------------------------------------------------------------

On first start, you'll see an empty launcher. Press the EDIT button (top right)
to enter the 'Configuration Editor'. You'll have to fill in the following
options for every new emulator/ system you want to configure:

>---[Launcher Prefix] : The name shown before 'Launcher' in the title. If you 
input e.g. 'GBA' here, it will later show up as 'GBA Launcher'.

>---[Unique ID] : A unique system ID. Should be short, unique, and sensible.
Sticking with the GBA example, a suitable system ID might be 'gba'. This name
is used for the system icon. The ROM Launcher will search for e.g. gba.png in 
the /icons/ directory.

>---[Emulator Executable Path] : The path (absolute/relative) or command to
launch the emulator. Use the 'Search File' button to search for the emulator
directly. You can then use the 'Make Relative' button to convert the path to
a relative path, if possible (this is optional).

>---[Emulator Arguments] : Optional arguments to use with the emulator. Enter
every argument individually. When arguments are used, the ROM-file should be
added as its own argument with %ROMFILE%. Again, this is usually not needed
unless you want to launch e.g. retroarch with a specific core.

>---[ROM Directories] : One or more directories containing ROMs for this system.
You can use the 'Search Directory' button to search for directories, then use
the 'Make Relative' button to convert the paths to relative paths, if possible
(this is optional).

>---[ROM File Types] : File-types of ROMs. Add without punctuation.

>---[CSS Background] : Optional CSS background value. You can enter a CSS
gradient here, like:
    
linear-gradient(0deg, rgba(0,164,113,1) 0%, rgba(0,129,156,1) 100%)
    
...there are plenty of websites that can generate a CSS gradient for you. Make
sure to enter only the value, without the 'background:'-part, or final
semicolon. Enter nothing for a default gradient.

>---[Order] : List order of the system relative to other systems. This isn't the
most elegant solution to sorting things, but it ... kind of works, so there you
go. Lowest numbers go first. If you leave enough space between numbers
(e.g. start with 0 and go up in steps of 100), you shouldn't have any issues
when inserting a new system between existing systems.

...then hit 'Save' and hope that the ROM Launcher doesn't complain.
If things do not load as expected even though you've entered everything
correctly, try restarting the ROM Launcher. If everything fails, try restoring
a previous configuration from the settings_backup.json file.

--------------------------------------------------------------------------------
(SLIGHTLY) ADVANCED CONFIGURATION-----------------------------------------------
--------------------------------------------------------------------------------

If you feel like it, you can edit the settings.json directly. This makes it
easier to e.g. find & replace strings, if needed. Overall, this is not
recommended.

--------------------------------------------------------------------------------
IN CASE OF ERROR----------------------------------------------------------------
--------------------------------------------------------------------------------

If, for some reason, your current configuration should be messed up, you can
restore your previous configuration by renaming settings_backup.json to
settings.json (and deleting the messed up settings.json).

Keep in mind that settings_backup.json only exists if you saved your
configuration at least twice.

--------------------------------------------------------------------------------
MISSING OR INCORRECT IMAGES-----------------------------------------------------
--------------------------------------------------------------------------------

You'll very likely see missing images after setting up a new system.
System icons need to be placed in the /icons/ folder. Icons need to be PNGs and
named after the system's unique ID. E.g. if your unique system ID is 'gba', your
icon should be called 'gba.png'. Icons need to be 32x32 pixels in size.

The 'additional_icons.7z' archive contains a great number of freeware icons by
'Yoshi'. You'll likely find something in the archive -- just rename it and
chuck it into the /icons/ folder (please note that not every icon in the
archive is of appropriate 32x32 pixel size).

You'll need an application like '7-zip' to un-archive the icons archive:
https://www.7-zip.org/

--------------------------------------------------------------------------------
LINUX VERSION-------------------------------------------------------------------
--------------------------------------------------------------------------------

This is the Windows release of 'ROM Launcher'.
In order to run ROM Launcher on Linux, download or build the Linux binaries 
of 'electron' and copy the contents of the /resources/ folder of this
release to the /resources/ folder of the Linux release of electron.

Please keep in mind that ROM Launcher uses the parent directory of the
electron executable as its working directory. That same directory should contain
the /icons/ folder, otherwise ROM Launcher won't be able to find them (the
parent directory will also contain the settings.json file).

Please also keep in mind that I didn't do any extensive testing of ROM
Launcher on Linux -- while mGBA launched fine in my Linux Mint VM, other
things may be broken.

--------------------------------------------------------------------------------
KNOWN ISSUES--------------------------------------------------------------------
--------------------------------------------------------------------------------

>---Some emulators will show the 'Failed to launch' message on normal exit.

This is expected behavior on emulators exiting with a non-zero value. ROM
Launcher will think it failed to find, or successfully launch the emulator.
This won't affect the vast majority of emulators, however.

>---Some changes don't take immediate effect after hitting 'Save'

Yeah, that's poor programming on my part. Just switch systems back and forth or
restart the application if that doesn't help.

--------------------------------------------------------------------------------
CONTACT / TROUBLESHOOTING-------------------------------------------------------
--------------------------------------------------------------------------------

If - after some time - you're unable to resolve an issue -- or if you have a
feature request, feel free to contact me on reddit (/u/TLOZ).
Please check out the KNOWN ISSUES first. I can't guarantee a fast response.

--------------------------------------------------------------------------------