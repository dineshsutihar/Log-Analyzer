import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from './errors';

/**
 * Validation middleware factory
 * Validates request based on Zod schema
 */
export const validate = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
                file: req.file,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message,
                }));

                res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errorMessages,
                });
            } else {
                next(error);
            }
        }
    };
};
