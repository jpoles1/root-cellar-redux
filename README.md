# Root Cellar

![Recipe search](https://github.com/jpoles1/root-cellar-redux/assets/366282/ce013ce7-64bb-4666-879e-01ba904d0141)

The goals of this project are to provide an open-source, light-weight, fully dockerized, self-hostable recipe management system. 

This is a complete rewrite of my original recipe management system [Root Cellar](https://github.com/jpoles1/root-cellar), which originally used a stack of Golang, MongoDB and Vue + Vuetify.

I wanted to modernize my tech stack and make some long-overdue improvements to the software. What resulted was Root Cellar Redux!

## Root Cellar Redux

I've rewritten the entire project using SvelteKit + Pocketbase in order to unify both backend and frontend functionality into one simple and straightforward codebase.

[Pocketbase](https://pocketbase.io/) allows us to quickly spin up a self-hosted database which persists to the filesystem, backed by a SQLite type database. It also has functionality for user authentication (eg: using OAuth), file uploading, and more.

## Features:
- Create recipes from scratch using a flexible interface
    - Can either write in raw text (ie: separating each ingredient or instruction on a new line)
    - Or use our visual/WYSIWYG editor
- Import recipes from other websites (using Google Recipe Metadata), including images and nutrition facts
- Search and share recipes with other users (or maintain your own private cookbook)
- Archive or make recipes private
- Fully self-hosted and dockerized: using SvelteKit, Pocketbase, and SQLite
- Nutrition facts with calculator (beta). Calculator uses nutrition databases to help estimate the nutritional value of your recipes

## Project Structure

- pb: contains all Pocketbase configuration/data
    - pb_migrations: contains migrations to setup the PocketBase SQLite database
    - pb_data: a shared volume with the Docker environment allowing persistence of database files
    - Dockerfile: builds a Pocketbase container
- web: contains all Sveltekit files to build the combined Frontend + Backend
    - .env: Used to set env variables in the local dev environment 
        - _Note: this file does not affect env variables in the docker container (see below)_
    - docker.env: Automatically copied from docker.env to .env on Dockerfile build.
    - src: all source code
        - routes: Sveltekit files, project structure dictates routing
        - lib: contains Svelte components and other js utilities

## How to Run:

Here's how to get up and running:

### Docker:
1) Download repo
```
git clone https://github.com/jpoles1/root-cellar-redux.git root-cellar
cd root-cellar
```
2) Configure dev env variables:

```
cd web
cp example.env .env
```

Now edit .env setting:
- HOST = (Root cellar server host | Default: 0.0.0.0)
- PORT= (Root cellar server port | Default: 4005)
- PUBLIC_POCKETBASE_URL= (Pocketbase Server URL | Default: https://127.0.0.1:4006/)

3) Finally run
```
docker compose up -d
```

### Development:
1) Run Pocketbase, you have two options:
- Use Docker to run only the pocketbase service (accessible at 127.0.0.1:4006): `docker compose up pb`
- Download and run Pocketbase: https://pocketbase.io/docs/. You will have to manually run the migrations using the files in the `pb` folder  
2) Clone the repo

```
git clone https://github.com/jpoles1/root-cellar-redux.git root-cellar
cd root-cellar
```

3) Configure dev env variables:

```
cd web
cp example.env .env
```

Now edit .env setting:
- HOST = (Root cellar server host | Default: 127.0.0.1)
- PORT= (Root cellar server port | Default: 5173)
- PUBLIC_POCKETBASE_URL= (Pocketbase Server URL | Default: https://127.0.0.1:8090/)

4) Install dependencies and run!

```
npm install
npm run dev
```

For production server you can use `npm run serve`

## Gallery:

![Entering nutrition data into calculator](https://blog.jpoles1.com/wp-content/uploads/2023/10/RootNutrition-1.gif)


## Nutrition Database References:

– Whalen, Lexington, Brie Turner-McGrievy, Matthew McGrievy, Andrew Hester, and Homayoun Valafar. “On Creating a Comprehensive Food Database.” In 2022 International Conference on Computational Science and Computational Intelligence (CSCI), pp. 1610-1614. IEEE, 2022.

– U.S. Department of Agriculture, Agricultural Research Service. FoodData Central, 2019. fdc.nal.usda.gov.

– Canadian Nutrient File, Health Canada, 2015