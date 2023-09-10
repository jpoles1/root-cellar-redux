# Root Cellar

The goals of this project are to provide an open-source, light-weight, fully dockerized, self-hostable recipe management system. 

This is a complete rewrite of my original recipe management system [Root Cellar](https://github.com/jpoles1/root-cellar), which originally used a stack of: 
- Golang
- MongoDB
- Vue + Vuetify

I wanted to modernize my tech stack and make some long-overdue improvements to the software. What resulted was Root Cellar Redux!

## Root Cellar Redux

I've rewritten the entire project using SvelteKit + Pocketbase in order to unify both backend and frontend functionality into one simple and straightforward codebase.

[Pocketbase](https://pocketbase.io/) allows us to quickly spin up a self-hosted database which persists to the filesystem, backed by a SQLite type database. It also has functionality for user authentication (eg: using OAuth), file uploading, and more.

### Project Structure

- pb: contains all Pocketbase configuration/data
    > pb_migrations: contains migrations to setup the PocketBase SQLite database
    > pb_data: a shared volume with the Docker environment allowing persistence of database files
    > Dockerfile: builds a Pocketbase container
- web: contains all Sveltekit files to build the combined Frontend + Backend
    > src: all source code
        > routes: Sveltekit files, project structure dictates routing
        > lib: contains Svelte components and other js utilities