# Codegarden
A game about gnomes, programming and gardening

NOTE: Codegarden is still in its early stages of development!
Expect glorious MS paint placeholder graphics intermixed with the actual good graphics, discrepancies between the design
document and reality, and a general inability to mute the Wilhelm Scream sound effect that is played whenever your gnome
falls off the edge of the level.

You can try out a snapshot of its current state [here](https://siriah.github.io/codegarden).

# Developer instructions

In order to develop, you'll first need to have git and npm available as command-line utilities.
- On Windows, you can get npm by installing [NodeJS](https://nodejs.org).
- On Debian Linux you'll also need to install the nodejs-legacy package (see this
[stackoverflow question](http://stackoverflow.com/questions/21168141/cannot-install-packages-using-node-package-manager-in-ubuntu)
 for the reason).

## Building from Source

Open a command line interface in the directory that contains this README file, and use the following command to install Codegarden's other dependencies locally:
- npm install

You can then build and run Codegarden with:
- npm start

Changes to the sourcecode will automatically cause the browser to refresh. While running in this mode, there is a level editor available under /levelEditor.

To run the automated tests, use one the following scripts:
- npm test
- npm run test-watch
The first runs the test once and then completes, the second will watch for changes and repeatedly re-run the tests.

## Deploying a new version to Github Pages
First, confirm that Codegarden is working properly. Then use the following script:
- npm run website

After this command completes, push the changed files in the 'docs' directory to Github.

# Trees

> Until you dig a hole, you plant a tree, you water it and make it
> survive, you haven't done a thing. You are just talking.
>
> -- <cite>Wangari Maathai</cite>
