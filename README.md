# ft_transcendence

## Installation

**1.** Clone this repository.

**2.** Create ".env" files in "backend" and "db" folders with the same contant as ".env.example" in these folders.

**3.** Run it with ```docker compose up -d``` command in project's folder.


## Description

It creates new database each time without saving changes after stopping containers. There is a script backend/pong/management/commands/first_run.py which initialize DB each time.

Use ```docker compose down``` to stop all containers and ```docker compose up -d --build``` to run again with changes in code.
