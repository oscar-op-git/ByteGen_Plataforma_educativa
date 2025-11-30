// backend/src/controllers/comment.controller.test.ts
import type { Request, Response } from 'express';
import {
  getPlantillaComment,
  postMainComment,
  postReply,
} from './comment.controller.js';
import * as commentService from '../services/comment.service.js';

// mock del service
jest.mock('../services/comment.service.js');

const mockedGetCommentForPlantilla =
  commentService.getCommentForPlantilla as jest.Mock;
const mockedCreateMainCommentForPlantilla =
  commentService.createMainCommentForPlantilla as jest.Mock;
const mockedCreateReplyForComment =
  commentService.createReplyForComment as jest.Mock;

function createMockRes() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe('comment.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlantillaComment', () => {
    test('devuelve 400 si plantillaId no es número válido', async () => {
      const req = {
        params: { plantillaId: 'abc' },
      } as unknown as Request;
      const res = createMockRes();

      await getPlantillaComment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'plantillaId inválido' });
    });

    test('devuelve 200 con el comment cuando el servicio funciona', async () => {
      const fakeComment = { id: 1, content: 'Hola' };
      mockedGetCommentForPlantilla.mockResolvedValueOnce(fakeComment);

      const req = {
        params: { plantillaId: '123' },
      } as unknown as Request;
      const res = createMockRes();

      await getPlantillaComment(req, res);

      expect(mockedGetCommentForPlantilla).toHaveBeenCalledWith(123);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ comment: fakeComment });
    });
  });

  describe('postMainComment', () => {
    test('devuelve 403 si user no puede comentar', async () => {
      const req = {
        params: { plantillaId: '1' },
        body: { content: 'Test' },
        user: null,
      } as unknown as Request;
      const res = createMockRes();

      await postMainComment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No tienes permisos para publicar comentarios en esta sección.',
      });
    });
  });

  describe('postReply', () => {
    test('devuelve 400 si commentId inválido', async () => {
      const req = {
        params: { commentId: 'abc' },
        body: { content: 'Hola' },
        user: { isAdmin: true },
      } as unknown as Request;
      const res = createMockRes();

      await postReply(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'commentId inválido' });
    });
  });
});
