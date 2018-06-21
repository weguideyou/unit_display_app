const fs = require('fs');
const {app, BrowserWindow, protocol, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const windowName = "main"

let myPort, myAddress

try {
  const connectionConfig = JSON.parse(fs.readFileSync('config/connection.json', 'utf8'));
  myPort = connectionConfig.port
  myAddress = connectionConfig.address
  console.log("Connection to:", myAddress, myPort)  
} catch (error) {
  console.log(error)
  console.log("Falling back to standart address...") 
  myPort = 1337
  myAddress = "127.0.0.1"
  console.log("Connection to:", myAddress, myPort) 
}


let debug = false;
let fullscreen = false;
let browserAlive = false;
let isConnected = false;

// taking care of commandline args
var arguments = process.argv.slice(2);
arguments.forEach(function(value,index, array) {
  let splittedArg = value.split("=");

  if ("fullscreen" == splittedArg[0] || "fs" == splittedArg[0])
  {
    fullscreen = true;
    console.log("app is now running in fullscreen mode");
  }

  if ("debug" == splittedArg[0])
  {
    debug = true;
    console.log("app is now running in debug mode");
  }

  if ("port" == splittedArg[0])
  {
    myPort = splittedArg[1]
    console.log("app is now running with different port " + myPort);
  }
});

// für ipc mit python
let net = require('net');
let client = new net.Socket();

let win

function createWindow () {
  win = new BrowserWindow({width: 1800, height: 1012, title: "Advanced AI stuff or not..."})

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
    name: windowName
  }))

  if (debug)
  {
    win.webContents.openDevTools();
  }

  if (fullscreen)
  {
    win.setFullScreen(true)
  }


  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})


let greetingManager = {
  sessions: new Map(),
  activeSession: undefined,
  interval: undefined,

  addData: function(name, area, position)
  {
    console.log(name, area);

    if (browserAlive && this.sessions.size == 0)
    {
        this.sessions.set(name, this.createNewEntry(name, area, position));
        console.log("cleared interval, found new dude");
        clearInterval(this.interval);
        this.startInterval();
    }
    if (!this.sessions.has(name))
    {
        this.sessions.set(name, this.createNewEntry(name, area, position));
        console.log("creating new entry for " + name);
    }
    else
    {

      // console.log("updating existing entry");
      let existingEntry = this.sessions.get(name);

      clearTimeout(existingEntry.timeout);

      existingEntry.timeout = setTimeout(function() {
        greetingManager.deleteEntry(name)
      }, 1500);

      existingEntry.area = area;
      existingEntry.position = position;

    }
  },

  createNewEntry: function(name,area,position)
  {
    return {
      "name": name,
      "timeout": setTimeout(function() {
        greetingManager.deleteEntry(name)
      }, 1000),
      "area": area,
      "position": position
    }
  },

  deleteEntry: function(name)
  {
    console.log("deleting entry " + name);
    console.log("");
    let sessionName = this.sessions.get(name).name;
    let activeName;
    if (this.activeSession != undefined && this.activeSession.hasOwnProperty("name"))
    {
      activeName = this.activeSession.name
    }
    else {
      activeName = undefined;
      console.log("+++++++++++++++++++++++++++++++++++++++++++ already deleted");
    }
    if (activeName != undefined && sessionName == activeName)
    {
      this.activeSession = undefined;
    }

    this.sessions.delete(name);
    win.webContents.send('stop-session' , {"name": name});
    // this.checkIfThereAreMoreFaces();

  },

  getSessionWithBiggestArea: function()
  {
    let keys = Array.from( this.sessions.keys() );
    let biggest;

    keys.forEach( key => {
      if (biggest == null)
      {
        biggest = this.sessions.get(key);
      }
      else
      {
        if (this.sessions.get(key).area >= biggest.area)
          biggest = this.sessions.get(key);
      }
    });
    return biggest;
  },

  sendNewSession: function()
  {
    let biggestSession = this.getSessionWithBiggestArea();
    if (biggestSession != null)
    {
      if (this.activeSession == null || this.activeSession.name != biggestSession.name)
      {
        this.activeSession = biggestSession;
        console.log("biggest session " + this.activeSession.name + " " + this.activeSession.area);
        console.log("sending new session");
        win.webContents.send('new-session' , {"name": this.activeSession.name });
      }
    }
    else
    {
      console.log("No session found");
    }
  },

  checkIfThereAreMoreFaces: function()
  {
    if(this.sessions.size > 0)
    {
      this.sendNewSession();
    }
  },

  startInterval: function()
  {
    if (isConnected)
    {
      console.log("starting up, sending new session");
      this.sendNewSession();

      interval = setInterval( () => {
        console.log("interval");
        if (this.sessions.size > 0)
        {
          greetingManager.sendNewSession();
        }
      }, 3000)
    }
    else
    {
      console.log("no conncection to backend, not starting interval");
      console.log("frontend runs in dummy mode");

      setTimeout(function () {
        console.log(1);
        win.webContents.send('stop-session' , {"name": "test2"});
      },200);
      setTimeout(function () {
        console.log(2);
        win.webContents.send('new-session' , {"name": "test1" });
      }, 300);
      setTimeout(function () {
        console.log(3);
        win.webContents.send('stop-session' , {"name": "test1"});

      }, 400);
      setTimeout(function () {
        console.log(4);
        win.webContents.send('new-session' , {"name": "test2" });

      }, 500);


      // creates weird in between state
      // setTimeout(function () {
      //   console.log(9);
      //   win.webContents.send('stop-session' , {"name": "test1"});
      //   win.webContents.send('new-session' , {"name": "test2" });
      //   win.webContents.send('stop-session' , {"name": "test2"});
      //   win.webContents.send('stop-session' , {"name": "test3"});
      //   win.webContents.send('stop-session' , {"name": "test4"});
      //   win.webContents.send('new-session' , {"name": "test2" });
      //   win.webContents.send('new-session' , {"name": "test1" });
      // }, 400);
      // setTimeout(function () {
      //   console.log(10);
      //   win.webContents.send('stop-session' , {"name": "test1"});
      //   win.webContents.send('stop-session' , {"name": "test3"});
      //   win.webContents.send('stop-session' , {"name": "test2"});
      //   win.webContents.send('new-session' , {"name": "test2" });
      //   win.webContents.send('new-session' , {"name": "test2" });
      //   win.webContents.send('stop-session' , {"name": "test4"});
      //   win.webContents.send('new-session' , {"name": "test1" });
      // }, 490);
    }
  }
}

// IPC mit python
client.connect({port: myPort, host: myAddress}, function() {
  isConnected = true;
	console.log('Connected');
});

client.on('data', function(data) {

  let message = data.toString();
  let splittedMessage = message.split(";");

  splittedMessage.forEach( value => {
    if (value != "")
    {
      let entry = JSON.parse(value) 
      greetingManager.addData(entry.name, entry.area, entry.position);
      win.webContents.send('position' , entry.position);
    }
  });

});

client.on('error', function(error) {
  if(error.code == "ECONNREFUSED")
  {
    console.log("connection refused - pyserver not started?");
  }
  else
  {
    console.log(error);
  }
  isConnected = false;
  client.destroy();
});

client.on('close', function() {
  isConnected = false;
	console.log('Connection closed');
});

// teste die verbindung zum browser window
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.sender.send('asynchronous-reply', 'hello from electron')
  browserAlive = true;
  greetingManager.startInterval();
})
