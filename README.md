# SEPTA Telework Tool
Penn State / Accenture SEPTA project repo

## Transporting the Application
This repo can be transported by forking the repo to another GitHub account or by downloading as a ZIP file and either reuploading to another source control location or moving to another location. Forking the repo can be done using embedded GitHub tools. Downloading the ZIP file can be done by cloning the repo using the GitHub web interface.

## Running the Application
The front end of the application relies on several files and directories, all of which are located within the UI directory at the root of the repo. The directories therein are as follows:

* UI/assets
  
  Contains data assets for visualizations, routes, and data sources produced by the model. This directory is required for running.

* UI/dist
  
  Contains the distribution script - main.js - which is the JavaScript file containing the entire application. This directory is required for running.
  
* UI/node_modules
  
  Contains dependencies. This directory is required for running.
  
* UI/src
  
  Contains the components for the application - these are built into the distribution script via WebPack. This directory is not required for running.
  
* UI/index.html

  This is the single page in which this single page application lives. This file is required for running.
  
To run this application, all required directories and files must be in the same directory within a web server. Running index.html will load all required components via the distribution script.

## Building the Application
The source files of this application are found within the UI/src directory. These components can be edited in any IDE that supports TypeScript/JavaScript. To create a new distribution script, that is, to build the application, use the console command `npx webpack` at the root of the front end, that is the UI directory. This will build a new main.js file within the dist directory.
