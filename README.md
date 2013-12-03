# Prototyper

## What is this thing?

The simples prototype REST API you could work with. It requires MongoDB as a backend.

## What is it good for

Whenever you want to showcase a frontend or mobile app based on a REST api but
don't want to spend time actually setting up the api for real.

## How does it work?

You have a bunch or URLs that you can work with:

 * GET /api/:collection ->returns a list of all the resources defined in that
 collection.

 eg: /api/cars ->list of cars
 **special parameters**:

 * * _max=10 : Maximum # of elements to return
 * * _start=20: Used together with _max, allows to do pagination of lists

 Filtering works by sending url parameter such as ?username=bob

 * POST /api/:collection -> add a new resource

 eg: POST /api/cars

     {
        "brand": "Tesla",
        "model": "S"
     }
 * GET /api/:collection/:id -> returns that resource
 * PUT /api/:collection/:id -> update that resource
 * DELETE /api/:collection/:id -> remove that resource

## User management

If you have defined a `users` collection and they have a `username` field,
doing a POST on /login with

    {
        "username": "bob"
    }

will log you in as "bob".

A POST on /logout will log you out.

A GET on /login will return the user data if someone is logged in.