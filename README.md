# CPSC 454 Group Project

# How to configure:

Create a file called backend/config.js
```bash
accessKeyId=YOUR_ACCESS_KEY_ID
secretAccessKey=YOUR_SECRET
region=us-east-1
user=postgres
host=image-database.*
database=images
password=*
port=5432

IdentityPoolId=us-east-*
IdentityPoolIdNoRegion=*
UserPoolId=us-east-1:*
IdentityPoolIdLong=us-east-1:*
IdentityPoolIdLongNoRegion=*
UserPoolIdNoPrefix=*
ClientId=*
```
And in frontend/src/config/index.js
```javascript
export default {
    region: 'us-east-1',
    IdentityPoolId: 'us-east-1_COGNITO_POOLID',
    UserPoolId: 'us-east-1:COGNITO-USERID',
    ClientId: 'COGNITO-CLIENTID',
    // This will be the upload endpoint that we got from the last tutorial
    // This is probably the wrong link
    s3SignedUrl: 'https://rvv1a9to8j.execute-api.eu-west-1.amazonaws.com/dev/upload-node'
}
```

# How to build:

```
cd backend
npm install
```

```
cd frontend
npm install
```

How to run:
```
cd frontend
npm run serve
```

```
cd backend
node index.js
```

# Deploy on AWS

```
git clone https://github.com/JJVillasis/CPSC-454-Group-Project

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash

# logout / login or $ source ~/.bashrc

nvm install stable

cd CPSC-454-Group-Project
```

References
1. https://github.com/nvm-sh/nvm