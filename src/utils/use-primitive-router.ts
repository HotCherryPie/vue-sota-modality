import { shallowReactive, toRef } from 'vue';
import type { Component, Ref } from 'vue';

export namespace PrimitiveRouter {
  export interface Route<TName extends string = string> {
    name: TName;
    component: Component;
  }
}

export interface PrimitiveRouter<TRouteName extends string> {
  currentRoute: Readonly<Ref<PrimitiveRouter.Route<TRouteName>>>;
  canNavigateBack: Readonly<Ref<boolean>>;
  addRoute: (route: PrimitiveRouter.Route<TRouteName>) => void;
  navigateTo: (routeName: TRouteName, replace: boolean) => void;
  navigateBack: () => void;
  clearNavigationHistory: () => void;
}

export interface UsePrimitiveRouterOptions<TRouteName extends string> {
  initialRoute: NoInfer<TRouteName>;
  initialHistory?: NoInfer<TRouteName>[] | undefined;
}

export const usePrimitiveRouter = <TRouteName extends string>(
  options: UsePrimitiveRouterOptions<NoInfer<TRouteName>>,
): PrimitiveRouter<NoInfer<TRouteName>> => {
  const routes = shallowReactive<Array<PrimitiveRouter.Route<TRouteName>>>([]);
  const navigationStack = shallowReactive<TRouteName[]>([
    ...(options.initialHistory ?? []),
    options.initialRoute,
  ]);
  const canNavigateBack = toRef(() => navigationStack.length > 1);
  // eslint-disable-next-line ts/no-non-null-assertion -- should be guaranteed
  const currentRouteName = toRef(() => navigationStack.at(-1)!);
  const currentRoute = toRef(
    // eslint-disable-next-line ts/no-non-null-assertion -- should be guaranteed
    () => routes.find((it) => it.name === currentRouteName.value)!,
  );

  const addRoute = (route: PrimitiveRouter.Route<TRouteName>) =>
    void routes.push(route);

  const navigateBack = () => {
    if (canNavigateBack.value) navigationStack.pop();
  };

  const navigateTo = (routeName: TRouteName, replace = false) => {
    // eslint-disable-next-line sonar/no-selector-parameter -- it's fine
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
