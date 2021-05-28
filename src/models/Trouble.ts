import { Document, Schema, model } from 'mongoose';

export interface IgroupMember {
    userId: string;
    oldestReadMessage: Date | null;
}

type IlistGroupReg = {
    owner: IgroupMember;
    members: [IgroupMember];
    type: 'basicList' | 'giftList' | 'giftGroup';
    name: string;
    createdAt: Date;
};

type IlistGroupChild = {
    owner: IgroupMember;
    members: [IgroupMember];
    type: 'childGiftList';
    name: string;
    createdAt: Date;
    parentGroupId: Schema.Types.ObjectId;
};

export type TlistGroupBase = IlistGroupReg | IlistGroupChild;
export type TlistGroup = Document & TlistGroupBase;

export const ListGroupSchema = new Schema({
    owner: {
        userId: { type: Schema.Types.ObjectId, required: true },
        oldestUnreadMsg: { type: Date, ref: 'user' },
    },
    members: [
        {
            userId: { type: Schema.Types.ObjectId, required: true },
            oldestUnreadMsg: { type: Date, ref: 'user' },
        },
    ],
    type: { type: String, required: true },
    name: { type: String, required: true },
    creationDate: { type: Date, required: true },
    parentGroupId: { type: Schema.Types.ObjectId },
});

const ListGroup = model<TlistGroup>('Test', ListGroupSchema);
export default ListGroup;

// Troubleshooting
// Making a new ListGroup with fields invalid in TlistGroupBase (missing parentGroupId in the example) doesn't throw an error - see example A.
// I only get errors if I declare the data object first (B), then create a new ListGroup using it (C)
// Seems a bit clunky. Is there a way to get type checking to work on A where I

// Fake Data

const now: Date = new Date();
const testUser = { userId: 'testid', oldestReadMessage: null };

// Doesn't type check anything
const A: TlistGroupBase = new ListGroup({
    owner: testUser,
    members: [testUser],
    type: 'childGiftList',
    name: 'myName',
    createdAt: Date.now(),
});

const B: TlistGroupBase = {
    owner: testUser,
    members: [testUser],
    type: 'childGiftList',
    name: 'myName',
    createdAt: now,
};

const C = new ListGroup(B);

// get rid of unused error
//@ts-ignore
let D = B;
