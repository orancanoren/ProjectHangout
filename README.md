# Project Hangout

Project hangout is a social application aiming to plan and execute social activities with ease. Please refer [here](https://documenter.getpostman.com/view/2347717/RWMCu9ix) for the API documentation.

## Short Term TODO List

- [ ] Devise a documentation
- [ ] Write unit tests for Backend
- [ ] Refactor the backend code into a better styled code, conforming to the MVC architecture
- [ ] Build a Docker container for backend to run into

## Software Requirements

This section describes the MVP requirements for Project Hangout.

### High level description

Project Hangout is a social application providing an easy to use interface for users to arrange social activities. Users are able to interact with each other through several ways; such as, friending each other, viewing past activities of other users, inviting each other for social activities, group chatting with activity participants and more. For MVP, the application will support iOS.

### Functional requirements

__A user must be able to__
- sign in and out of the application
- search for other users and retrieve the shortest distance of friendship to resulting users
- add and receive frienship invitations
- quickly plan a social activity and invite other users to this plan
- retrieve a feed consisting of friends' activities

### Detailed description of event planning

When a user starts a new event, the event creator will enter the time (date) and place of the app (arbitrary string, e.g. "our favorite Starbucks"); location will be chosen from a map API and all event participants will be able to view the location. Following these basic details of the event, the creator will be provided with the user search view, where the creator will be able to invite others to the event. Following this seconds phase, the event will be created and a chat room for the event participants will be created. In this chat view, participants will be able to:
1. Propose an invitation for a new member to the event
2. Propose a time/location change