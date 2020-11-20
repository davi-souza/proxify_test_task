# Davi Proxify Test

## Project structure

There are 3 auxiliaries files:

-   `db_setup.js`: db setup script to create the table and the initial data
-   `pool.js`: creates the connection pool of the database and exports it and a function to create a client from the pool
-   `index.js`: runs the db setup function and creates 3 workers of the distributed system. This file is to simulate the workers initialization and to see them working.

The file `worker.js` is where the code of the workers of the distributed system is located.

## How to run

Please note that the credentials to connect to the database is located at `pool.js`. If you want to customize it, you can change all the information there.

### Using Docker

#### PostgreSQL on a container

Run the following command to start postgres service

```bash
docker-compose up -d database
```

**Note 1:** if you want to customize the credentials to the database, you can change the `environment` field at the `docker-compose.yaml`

**Note 2:** docker-compose might throw some errors about the missing `network` and the missing `volume`. But it is going to you how to install both.

#### Main container

Run the following command to enter the main docker container

```bash
docker-compose run proxify /bin/bash
```

Now you're inside the container. You can run the following command to install the dependecies

```bash
npm i

# or using yarn

yarn
```

Now with everything set, just run the following command to see the result of the `worker` algorithm:

```bash
node index.js
```

At the end, run the following commands to kill the docker containers:

```bash
docker kill database
docker rm $(docker ps -aq)
```

### Without using Docker

The project uses

-   PostgreSQL version 12
-   node version 12.18.4
-   npm version 6.14.6
-   yarn 1.22.4

Please, set up the credentials of the database at the file `pool.js` to give the code the access to it.

To install the dependencies, run the following command

```bash
npm i

# or using yarn:

yarn
```

Now with everything set, just run the following command to see the result of the `worker` algorithm:

```bash
node index.js
```
