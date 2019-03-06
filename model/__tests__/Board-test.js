import Board from '../board/Board';

const board = new Board();

it('Instance of board created successfully', () => {
  expect(typeof board).toBe('object');
  expect(board).toBeTruthy();
});
