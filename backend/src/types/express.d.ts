declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string | null;
        name: string | null;
        verified: boolean;
        isAdmin: boolean;
        roleId: number | null;     
        roleName: string | null;    
      };
    }
  }
}

export {};
