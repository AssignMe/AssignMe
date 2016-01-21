# AssignMe
Generating mass GitHub repos/teams under an existing organization and assigning users to their corresponding teams. 
At the end there is an option for changing their access to read only.

#### Environment setup:
You need Node.js on your system to be able to run this script.

- #### Installing Node.js:
  ##Linux: 
  * See [tutorial here](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-an-ubuntu-14-04-server) for other ways:
  ``` bash
  curl https://raw.githubusercontent.com/creationix/nvm/v0.16.1/install.sh | sh
  source ~/.profile
  nvm ls-remote
  nvm install v0.11.16
  nvm use 0.11.16
  node -v
  # See where installed
  which node 
  ```

  You may want to add `nvm use 0.11.16` add the end of your .bashrc/.profile


 ## Windows (tested on win 7, 10):
  - #### Setting up environment
    * Seting up basic requirements:
      Install Microsoft Visual Studio (community/express versions are enough)
  
  - #### Installing Node.js:
    * For 64-bit Windows download and install: [Node.js 0.11.16 64-bit](https://nodejs.org/dist/v0.11.16/x64/node-v0.11.16-x64.msi)
    * For 32-bit Windows download and install: [Node.js 0.11.16 32-bit](https://nodejs.org/dist/v0.11.16/node-v0.11.16-x86.msi)

  You may want to add `PATH/TO/NODE-NPM` to your environment path (if it was not added automatically).




## To start using the scrip: 
* _If it's the first time you run the script_ do `npm install`
* Create a text file "token" -no prefix- which contains [your own token] (https://help.github.com/articles/creating-an-access-token-for-command-line-use/)
  - It's content should look like (dummy token): `token 5199831f4dd3b79e7c5b7e0ebe75d67aa66e79d4`
* To run the script: `node assignme.js`
