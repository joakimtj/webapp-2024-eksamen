#import "@preview/rubber-article:0.1.0": *
#import "@preview/fletcher:0.5.1" as fletcher: diagram, node, edge

#show: article.with(
  lang:"en",
  eq-numbering:none,
  text-size:11pt,
  page-numbering: "1",
  page-numbering-align: center,
  heading-numbering: "1.1  ",
)

#maketitle(
  title: "webapp-2024-eksamen",
  authors: (
    "Joakim Tollefsen Johannesen\nHøgskolen i Østfold\njoakimtj@hiof.no",
    "Niklas Berby\nHøgskolen i Østfold\nniklab@hiof.no"
  ),
  date: "November 28. 2024",
)

// Your content goes below.

= Oppgave 1

== Introduction
Most of the structure and content of this project is based heavily on the project of which this was forked from. The project is a web application that is used to manage a list of courses as well as their respective lessons. The lessons contain various fields that will be displayed to the user. Very little of the design ideas have been changed, but the code has been refactored to accomodate for backend changes.

== Architecture
The original project was built using Next.js and Hono. We expanded upon this in several ways, as described below.

== API Documentation (1.1)
Please refer to `oppgave1/doc.md` for the API documentation of this project.

== Frontend changes (1.2)
The frontend has been updated to untangle the routing logic of the original project. In addition to this, it relies on API calls to manage the data. 

== Backend changes (1.3)
We implemented a SQLite database to store the data. Interfacing with the database is done through the `better-sqlite3` npm package. A "service" layer has been added to the backend to handle the database operations, even for operations that are not currently represented in the frontend.

Several endpoints are exposed that allow the frontend to interact with the backend, and in turn the database. 

== Editor changes (1.4)
No changes have been made to the text editor.

== Testing (1.5)
The project had outlined several Playwright tests, and most of these have been implemented and should pass.


= Oppgave 2