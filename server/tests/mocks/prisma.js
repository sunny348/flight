import { mockDeep } from "vitest-mock-extended";

// A deep-mocked PrismaClient shared by the tests. Test files point
// `vi.mock("../src/lib/prisma.js", ...)` at this module so every controller
// uses this instance, and reset it between tests with `mockReset`.
const prismaMock = mockDeep();

export default prismaMock;
