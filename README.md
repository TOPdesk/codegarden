# Codegarden
A game about gnomes, programming and gardening

NOTE: Codegarden is still in its early stages of development!
Expect glorious MS paint placeholder graphics intermixed with the actual good graphics, discrepancies between the design
document and reality, and a general inability to mute the Wilhelm Scream sound effect that is played whenever your gnome
falls off the edge of the level.

You can try out a snapshot of its current state [here](https://siriah.github.io/codegarden).

# Developer instructions

## Building from Source

First make sure you have git and npm available as command-line utilities (so you should install Git and NodeJS if you don't have them already).
You also need gulp, which you can get from npm by opening the command line interface of your operating system and typing the following command:

- npm install -g gulp

Open a command line interface in the directory that contains this README file, and use the following command to install Codegarden's other dependencies locally:
- npm install

Then finally, run the following command in the command line interface to start a browser running Codegarden.
- gulp

Changes to the sourcecode will automatically cause the browser to refresh. While running in this mode, there is a level editor available under /levelEditor.

To run tests run:
- gulp test

### Debian specific instructions

Just as the general recipe above, but install the npm and nodejs-legacy
package (see this [stackoverflow
question](http://stackoverflow.com/questions/21168141/cannot-install-packages-using-node-package-manager-in-ubuntu)
for the reason). The npm install -g commands have to be run using
sudo, because this installs global packages.

## Deploying a new version to Github Pages
Before deploying, check that the game compiles and starts up without errors. Then run:
- gulp website

After this command completes, push the changed files in the 'docs' directory to Github.

# Trees

> Until you dig a hole, you plant a tree, you water it and make it
> survive, you haven't done a thing. You are just talking.
>
> -- <cite>Wangari Maathai</cite>
