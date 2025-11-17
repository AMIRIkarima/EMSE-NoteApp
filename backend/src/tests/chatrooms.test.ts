//import { assert, expect, it, beforeEach, afterAll, describe } from 'vitest';
//import { default as supertest } from 'supertest';
//import { app, server } from '../server';
//
//beforeEach(() => {
//  app.locals.resetData();
//});
//
//describe('GET /chatrooms', () => {
//  it('Give the list of existing chatrooms', async () => {
//    app.locals.addChatroom({ creator: 'Bob', title: 'Secondary' });
//
//    const res = await supertest(app).get('/chatrooms');
//    expect(res.status).toBe(200);
//
//    expect(res.body).toEqual([
//      {
//        id: 0,
//        creator: 'admin',
//        title: 'Main',
//        nbMessages: 1
//      },
//      {
//        id: expect.any(Number),
//        creator: 'Bob',
//        title: 'Secondary',
//        nbMessages: 1
//      }
//    ]);
//  });
//
//  it('Give the correct number of messages for a chat', async () => {
//    app.locals.addMessage(0 /* chatroomId */, {
//      author: 'Bob',
//      message: 'hello'
//    });
//    app.locals.addMessage(0 /* chatroomId */, {
//      author: 'Bob',
//      message: 'hello'
//    });
//
//    const res = await supertest(app).get('/chatrooms');
//    expect(res.status).toBe(200);
//
//    expect(res.body).toEqual([
//      {
//        id: 0,
//        creator: 'admin',
//        nbMessages: 3,
//        title: 'Main'
//      }
//    ]);
//  });
//});
//
//describe('POST /chatrooms', () => {
//  it('should return 200 on correct request, and the return the created chatroom object', async () => {
//    const response = await supertest(app)
//      .post('/chatrooms')
//      .send({
//        creator: 'Bob',
//        title: 'My Chatroom'
//      })
//      .set('Content-Type', 'application/json');
//
//    expect(response.statusCode).toBe(200);
//    expect(response.body).toEqual({
//      creator: 'Bob',
//      title: 'My Chatroom',
//      nbMessages: 1,
//      id: expect.any(Number)
//    });
//
//    expect(app.locals.chatrooms.length).toEqual(2);
//  });
//
//  it('Should reply a 400 error if creator is missing, and not create a new chatroom', async () => {
//    const response = await supertest(app)
//      .post('/chatrooms')
//      .send({
//        title: 'My chatroom'
//      })
//      .set('Content-Type', 'application/json');
//
//    expect(response.statusCode).toBe(400);
//    expect(response.body).toEqual({
//      error: 'Bad request',
//      message: "property 'creator' is missing"
//    });
//
//    expect(app.locals.chatrooms.length).toEqual(1);
//  });
//
//  it('Should reply a 400 error if title is missing, and not create a new chatroom', async () => {
//    const response = await supertest(app)
//      .post('/chatrooms')
//      .send({
//        creator: 'Bob'
//      })
//      .set('Content-Type', 'application/json');
//
//    expect(response.statusCode).toBe(400);
//    expect(response.body).toEqual({
//      error: 'Bad request',
//      message: "property 'title' is missing"
//    });
//
//    expect(app.locals.chatrooms.length).toEqual(1);
//  });
//});
//
//describe('DELETE /chatrooms/:id', () => {
//  it('Should delete the given chatroom, return the deleted object as json', async () => {
//    const chatroomId = app.locals.addChatroom({
//      creator: 'Bob',
//      title: 'Secondary'
//    }).id;
//
//    const res = await supertest(app).delete(`/chatrooms/${chatroomId}`);
//
//    expect(res.status).toEqual(200);
//    expect(res.body).toEqual({
//      id: expect.any(Number),
//      creator: 'Bob',
//      title: 'Secondary',
//      nbMessages: 1
//    });
//
//    expect(app.locals.chatrooms.length).toEqual(1);
//  });
//
//  it('Should forbid the deletion of chatroom with ID 0', async () => {
//    const res = await supertest(app).delete('/chatrooms/0');
//    expect(res.status).toEqual(403);
//    expect(res.body).toEqual({
//      error: 'Operation forbidden',
//      message: 'You cannot delete the main chatroom'
//    });
//  });
//
//  it('returns 404 if the given chatroomId doesnt exist', async () => {
//    const res = await supertest(app).delete('/chatrooms/987654321');
//    expect(res.status).toEqual(404);
//    expect(res.body).toEqual({
//      error: 'Not found',
//      message: "Chatroom with id 987654321 doesn't exist"
//    });
//  });
//});
//
//afterAll(() => server.close());
//
////test('Give the list of existing chatrooms', async () => {
////  app.locals.addChatroom({creator: 'Bob', title: 'Secondary'});
////
////  const res = await supertest(app).get('/chatrooms');
////  expect(res.status).toBe(200);
////
////  expect(res.body).toEqual([{
////    id: 0,
////    creator: 'admin',
////    title: 'Main',
////    nbMessages: 1
////  }, {
////    id: expect.any(Number),
////    creator: 'Bob',
////    title: 'Secondary',
////    nbMessages: 1
////  }]);
////});
