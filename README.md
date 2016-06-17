# sftp fork

This repo is a fork of https://github.com/ajaxorg/node-sftp.
I already improved the lib and fixed bugs.


### tests

- Tests are run against a real sftp server, which you will have to provide.
- The server should only allow connecting with a private key
- provided sftp data is passed into test via env variables (to be improved later):
    ```
    NODE_SFTP_USERNAME=user NODE_SFTP_HOST=yourSftpHost NODE_SFTP_PORT=2222 NODE_SFTP_PRIVATEKEY=pathToPrivateKey mocha
    ```
