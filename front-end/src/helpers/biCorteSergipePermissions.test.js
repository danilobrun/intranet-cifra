import { canAccessBiCorteSergipe } from "./biCorteSergipePermissions";

describe("canAccessBiCorteSergipe", () => {
  it.each(["1", "dono"])("permite o codigo %s", (code) => {
    expect(canAccessBiCorteSergipe({ roles: [{ code }] })).toBe(true);
  });

  it("verifica todas as roles do usuario", () => {
    expect(
      canAccessBiCorteSergipe({
        roles: [{ code: "sergipe" }, { code: "dono" }],
      }),
    ).toBe(true);
  });

  it.each([
    undefined,
    {},
    { roles: [] },
    { roles: [{ code: "sergipe" }] },
    { roles: [{ code: "ceo" }] },
  ])("nega usuarios sem uma role permitida", (user) => {
    expect(canAccessBiCorteSergipe(user)).toBe(false);
  });
});
