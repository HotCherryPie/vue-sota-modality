import { shallowReactive, toRef } from 'vue';
import type { Component } from 'vue';

export interface Route<TName extends string = string> {
  name: TName;
  component: Component;
}

export interface UseModalRouterOptions<TRouteName extends string> {
  initialRoute: TRouteName;
}

export const useModalRouter = <TRouteName extends string>(
  options: UseModalRouterOptions<TRouteName>,
) => {
  const routes = shallowReactive<Array<Route<TRouteName>>>([]);
  const navigationStack = shallowReactive<TRouteName[]>([options.initialRoute]);
  const canNavigateBack = toRef(() => navigationStack.length > 1);
  // eslint-disable-next-line ts/no-non-null-assertion -- should be guaranteed
  const currentRouteName = toRef(() => navigationStack.at(-1)!);
  const currentRoute = toRef(
    // eslint-disable-next-line ts/no-non-null-assertion -- should be guaranteed
    () => routes.find((it) => it.name === currentRouteName.value)!,
  );

  const addRoute = (route: Route<TRouteName>) => void routes.push(route);

  const navigateBack = () => {
    if (canNavigateBack.value) navigationStack.pop();
  };

  const navigateTo = (routeName: TRouteName, replace = false) => {
    if (replace) navigationStack[navigationStack.length - 1] = routeName;
    else navigationStack.push(routeName);
  };

  const clearNavigationHistory = () => {
    const currentRoute = currentRouteName.value;
    navigationStack.length = 1;
    navigationStack[0] = currentRoute;
  };

  return {
    currentRoute,
    canNavigateBack,
    addRoute,
    navigateTo,
    navigateBack,
    clearNavigationHistory,
  };
};
