# CloudSim Kiosk

The CloudSim kiosk allows you to run Gazebo simulations in the cloud.

Make targets:

sudo make install

This command calls npm install, which downloads all the node packages necessary (see package.json)

make lint

This command runs jslint on the source code

make

This command calls mocha (the unit testing framework) and generates a report.xml file that is compatible with Jenkins.

