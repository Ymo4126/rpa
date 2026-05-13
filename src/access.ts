export default (initialState: API.UserInfo) => {
  const permissions: Record<string, boolean> = {};

  if (initialState?.menus) {
    const extractCodes = (menus: any[]) => {
      menus.forEach(menu => {
        if (menu.code) {
          permissions[menu.code] = true;
        }
        if (menu.children) {
          extractCodes(menu.children);
        }
      });
    };

    extractCodes(initialState.menus);
  }
  if (initialState?.permissions) {
    initialState.permissions.forEach((perm: string) => {
      permissions[perm] = true;
    });
  }
  console.log(permissions);

  return permissions;
};
