# sftp fork

The lib started as a fork of the now non-existent https://github.com/ajaxorg/node-sftp.
We've made some improvements, fixed some bugs and added tests!

The Lib currently only supports connecting with username & private key, no passoword support fot now.

### usage
(documenation not full at the moment, will improve with time)

creation of client:
```
var Sftp = require('sftp-wrapper');
var sftpClient = new Sftp({
          host: 'host',
          username: 'username',
          port: 'port',
          privateKey: 'pathToPrivateKey'
        }, function(err) {

```

usage of client with callback of function(err, result):
```
sftpClient.cd(path, cb)
sftpClient.stat(path, cb)
sftpClient.pwd(cb)
sftpClient.mkdir(path, cb)
sftpClient.mkdirp(path, cb)
sftpClient.readdir(path, cb) - dir file listing
sftpClient.readFile(filename, encoding,, cb) - dir file listing
sftpClient.disconnect(cb)
rename, rmdir

sftpClient.writeFile(filename, data, encoding, checkIfFileExists, callback, progresscb)
```
### tests

- Tests are run against a real sftp server, which you will have to provide.
- The server should only allow connecting with a private key
- provided sftp data is passed into test via env variables (to be improved later):
    ```
    NODE_SFTP_USERNAME=user NODE_SFTP_HOST=yourSftpHost NODE_SFTP_PORT=2222 NODE_SFTP_PRIVATEKEY=pathToPrivateKey mocha
    ```
