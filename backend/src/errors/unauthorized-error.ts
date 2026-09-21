class UnauthorizedError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 401;
    this.name = 'UnauthorizedError';
  }
}

export default UnauthorizedError;
