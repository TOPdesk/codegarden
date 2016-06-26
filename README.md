# Codegarden
A game about gnomes, programming and gardening

NOTE: Codegarden is still in its early stages of development!

## Building from Source

In order to run the current version, first make sure you have git and npm available as command-line utilities (so you should install Git and NodeJS if you don't have them already). You also need gulp and bower, which you can get from npm by opening a command line window and running the following commands:

- npm install -g bower
- npm install -g gulp

Open a command line interface in the directory that contains this README file, and use the following commands to install Codegarden's other dependencies locally:
- npm install
- bower install

Then finally, run the following command in the command line interface to start a browser running Codegarden.
- gulp

Changes to the sourcecode will automatically cause the browser to refresh, but Gulp will stop running if you save a broken file. You can just run it again with 'gulp'.

To run tests run:
- gulp test

### Debian specific instructions

Just as the general recipe above, but install the npm and nodejs-legacy
package (see this [stackoverflow
question](http://stackoverflow.com/questions/21168141/cannot-install-packages-using-node-package-manager-in-ubuntu)
for the reason). The npm install -g commands have to be run using
sudo, because this installs global packages.

## Gameplay

### Tutorial levels

In the tutorial there are clear goals to win the current level. Every
level introduces some gameplay elements that are important for the
main game. It is recommended you play through the tutorial before you
start playing in the main game (which is still in development).

### Tutorial Level 1 - Watering the Tree

> Until you dig a hole, you plant a tree, you water it and make it
> survive, you haven't done a thing. You are just talking.
>
> -- <cite>Wangari Maathai</cite>

Welcome to Codegarden! In this game you control gnomes that can alter
their environment. Gnomes have to be told their task in extreme detail
before they set off to work. They will follow your orders exactly,
even if this might cause them to get into trouble!

In this first level, you will have to instruct the gnome to go and
tend to the tree. It looks really thirsty...