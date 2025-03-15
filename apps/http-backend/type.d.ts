declare namespace Express {
  export interface Request {
    user: jwt.JwtPayload;
  }
}


