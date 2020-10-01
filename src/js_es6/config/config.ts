import { AssertError, UnreachableCaseError } from '../errors/error';
import { JsonValue, Side } from '../utils/types';
import { deepExtendValue } from '../utils/utils';

export interface ItemConfig {
    // see UserItemConfig for comments
    type: ItemConfig.Type;
    content: ItemConfig[];
    width: number;
    minWidth: number;
    height: number;
    minHeight: number;
    id: string | string[];
    isClosable: boolean;
    title: string;
    reorderEnabled: boolean;

    activeItemIndex: number;
}

export namespace ItemConfig {
    export const enum Type {
        root = 'root',
        row = 'row',
        column = 'column',
        stack = 'stack',
        component = 'component',
        reactComponent = 'react-component',
    }

    export type HeightOrWidthPropertyName = 'height' | 'width';

    export const defaults: ItemConfig = {
        type: ItemConfig.Type.stack, // not really default but need something
        content: [],
        width: 50,
        minWidth: 0,
        height: 50,
        minHeight: 0,
        id: '',
        isClosable: true,
        reorderEnabled: true,
        title: '',
        activeItemIndex: -1,
    }

    /** Creates a copy of the original ItemConfig using an alternative content if specified */
    export function createCopy(original: ItemConfig, content?: ItemConfig[]): ItemConfig {
        switch (original.type) {
            case ItemConfig.Type.root:
            case ItemConfig.Type.row:
            case ItemConfig.Type.column:
            case ItemConfig.Type.stack:
                const result: ItemConfig = {
                    type: original.type,
                    content: content ?? copyContent(original.content),
                    width: original.width,
                    minWidth: original.minWidth,
                    height: original.height,
                    minHeight: original.minHeight,
                    id: original.id,
                    isClosable: original.isClosable,
                    reorderEnabled: original.reorderEnabled,
                    title: original.title,
                    activeItemIndex: original.activeItemIndex,
                }
                return result;

            case ItemConfig.Type.component:
                return JsonComponentConfig.createCopy(original as JsonComponentConfig);

            case ItemConfig.Type.reactComponent:
                return ReactComponentConfig.createCopy(original as ReactComponentConfig);

            default:
                throw new UnreachableCaseError('CICC91354', original.type, 'Invalid Config Item type specified');
        }
    }

    export function copyContent(original: ItemConfig[]): ItemConfig[] {
        const count = original.length;
        const result = new Array<ItemConfig>(count);
        for (let i = 0; i < count; i++) {
            result[i] = ItemConfig.createCopy(original[i]);
        }
        return result;
    }

    export function createDefault(type: Type): ItemConfig {
        switch (type) {
            case ItemConfig.Type.root:
                throw new AssertError('CICCDR91562'); // Get default root from ManagerConfig
            case ItemConfig.Type.row:
            case ItemConfig.Type.column:
            case ItemConfig.Type.stack:
                const result: ItemConfig = {
                    type: defaults.type,
                    content: defaults.content,
                    width: defaults.width,
                    minWidth: defaults.minWidth,
                    height: defaults.height,
                    minHeight: defaults.minHeight,
                    id: defaults.id,
                    isClosable: defaults.isClosable,
                    reorderEnabled: defaults.reorderEnabled,
                    title: defaults.title,
                    activeItemIndex: defaults.activeItemIndex,
                }
                return result;

            case ItemConfig.Type.component:
                return JsonComponentConfig.createDefault();

            case ItemConfig.Type.reactComponent:
                return ReactComponentConfig.createDefault();

            default:
                throw new UnreachableCaseError('CICCDD91563', type, 'Invalid Config Item type specified');
        }
    }
}

// Stack or Component
export interface HeaderedItemConfig extends ItemConfig {
    header: HeaderedItemConfig.Header | undefined; // undefined means get header settings from ManagerConfig
}

export namespace HeaderedItemConfig {
    export interface Header {
        // undefined means get property value from ManagerConfig
        show: false | Side | undefined;
        popout: false | string | undefined;
        dock: false | string | undefined;
        maximise: false | string | undefined;
        close: string | undefined;
        minimise: string | undefined;
        tabDropdown: false | string | undefined;
    }

    export namespace Header {
        export function createCopy(original: Header | undefined): Header | undefined {
            if (original === undefined) {
                return undefined;
            } else {
                return {
                    show: original.show,
                    popout: original.popout,
                    dock: original.dock,
                    close: original.close,
                    maximise: original.maximise,
                    minimise: original.minimise,
                    tabDropdown: original.tabDropdown,
                }
            }
        }
    }
}

export type StackItemConfig = HeaderedItemConfig

export interface ComponentConfig extends HeaderedItemConfig {
    /**
     * The name of the component as specified in layout.registerComponent. Mandatory if type is 'component'.
     */
    componentName: string;
}

export namespace ComponentConfig {
    export function isReact(config: ComponentConfig): config is ReactComponentConfig {
        return config.type === ItemConfig.Type.reactComponent;
    }
    export function isJson(config: ComponentConfig): config is JsonComponentConfig {
        return config.type === ItemConfig.Type.component;
    }
}

export interface JsonComponentConfig extends ComponentConfig {
    // see UserJsonComponentConfig for comments
    componentState: JsonValue;
}

export namespace JsonComponentConfig {
    export function createCopy(original: JsonComponentConfig): JsonComponentConfig {
        const result: JsonComponentConfig = {
            type: original.type,
            content: ItemConfig.copyContent(original.content),
            width: original.width,
            minWidth: original.minWidth,
            height: original.height,
            minHeight: original.minHeight,
            id: original.id,
            isClosable: original.isClosable,
            reorderEnabled: original.reorderEnabled,
            title: original.title,
            activeItemIndex: original.activeItemIndex,
            header: HeaderedItemConfig.Header.createCopy(original.header),
            componentName: original.componentName,
            componentState: deepExtendValue(undefined, original.componentState) as JsonValue,
        }
        return result;
    }

    export function createDefault(): JsonComponentConfig {
        const result: JsonComponentConfig = {
            type: ItemConfig.Type.component,
            content: ItemConfig.defaults.content,
            width: ItemConfig.defaults.width,
            minWidth: ItemConfig.defaults.minWidth,
            height: ItemConfig.defaults.height,
            minHeight: ItemConfig.defaults.minHeight,
            id: ItemConfig.defaults.id,
            isClosable: ItemConfig.defaults.isClosable,
            reorderEnabled: ItemConfig.defaults.reorderEnabled,
            title: ItemConfig.defaults.title,
            activeItemIndex: ItemConfig.defaults.activeItemIndex,
            header: undefined,
            componentName: '',
            componentState: {},
        }
        return result;
    }
}

export interface ReactComponentConfig extends ComponentConfig {
    // see UserReactComponentConfig for comments
    props?: unknown;
}

export namespace ReactComponentConfig {
    export const REACT_COMPONENT_ID = 'lm-react-component'

    export function createCopy(original: ReactComponentConfig): ReactComponentConfig {
        const result: ReactComponentConfig = {
            type: original.type,
            content: ItemConfig.copyContent(original.content),
            width: original.width,
            minWidth: original.minWidth,
            height: original.height,
            minHeight: original.minHeight,
            id: original.id,
            isClosable: original.isClosable,
            reorderEnabled: original.reorderEnabled,
            title: original.title,
            activeItemIndex: original.activeItemIndex,
            header: HeaderedItemConfig.Header.createCopy(original.header),
            componentName: REACT_COMPONENT_ID,
            props: deepExtendValue(undefined, original.props),
        }
        return result;
    }

    export function createDefault(): JsonComponentConfig {
        const result: JsonComponentConfig = {
            type: ItemConfig.Type.reactComponent,
            content: ItemConfig.defaults.content,
            width: ItemConfig.defaults.width,
            minWidth: ItemConfig.defaults.minWidth,
            height: ItemConfig.defaults.height,
            minHeight: ItemConfig.defaults.minHeight,
            id: ItemConfig.defaults.id,
            isClosable: ItemConfig.defaults.isClosable,
            reorderEnabled: ItemConfig.defaults.reorderEnabled,
            title: ItemConfig.defaults.title,
            activeItemIndex: ItemConfig.defaults.activeItemIndex,
            header: undefined,
            componentName: '',
            componentState: {},
        }
        return result;
    }
}

export interface ManagerConfig {
    content: ItemConfig[];
    openPopouts: PopoutManagerConfig[];
    dimensions: ManagerConfig.Dimensions;
    settings: ManagerConfig.Settings;
    header: ManagerConfig.Header;
}

export namespace ManagerConfig {
    export interface Settings {
        // see UserConfig.Settings for comments
        constrainDragToContainer: boolean;
        reorderEnabled: boolean;
        selectionEnabled: boolean;
        popoutWholeStack: boolean;
        blockedPopoutsThrowError: boolean;
        closePopoutsOnUnload: boolean;
        showPopoutIcon: boolean;
        showMaximiseIcon: boolean;
        showCloseIcon: boolean;
        responsiveMode: Settings.ResponsiveMode;
        tabOverlapAllowance: number;
        reorderOnTabMenuClick: boolean;
        tabControlOffset: number;
    }

    export namespace Settings {
        export const enum ResponsiveMode {
            'none',
            'always',
            'onload',
        }

        export const defaults: ManagerConfig.Settings = {
            constrainDragToContainer: true,
            reorderEnabled: true,
            selectionEnabled: false,
            popoutWholeStack: false,
            blockedPopoutsThrowError: true,
            closePopoutsOnUnload: true,
            showPopoutIcon: true,
            showMaximiseIcon: true,
            showCloseIcon: true,
            responsiveMode: ManagerConfig.Settings.ResponsiveMode.onload,
            tabOverlapAllowance: 0,
            reorderOnTabMenuClick: true,
            tabControlOffset: 10
        }

        export function createCopy(original: Settings): Settings {
            return {
                constrainDragToContainer: original.constrainDragToContainer,
                reorderEnabled: original.reorderEnabled,
                selectionEnabled: original.selectionEnabled,
                popoutWholeStack: original.popoutWholeStack,
                blockedPopoutsThrowError: original.blockedPopoutsThrowError,
                closePopoutsOnUnload: original.closePopoutsOnUnload,
                showPopoutIcon: original.showPopoutIcon,
                showMaximiseIcon: original.showMaximiseIcon,
                showCloseIcon: original.showCloseIcon,
                responsiveMode: original.responsiveMode,
                tabOverlapAllowance: original.tabOverlapAllowance,
                reorderOnTabMenuClick: original.reorderOnTabMenuClick,
                tabControlOffset: original.tabControlOffset,
            }
        }
    }

    export interface Dimensions {
        // see UserConfig.Dimensions for comments
        borderWidth: number;
        borderGrabWidth: number,
        minItemHeight: number;
        minItemWidth: number;
        headerHeight: number;
        dragProxyWidth: number;
        dragProxyHeight: number;
    }

    export namespace Dimensions {
        export function createCopy(original: Dimensions): Dimensions {
            return {
                borderWidth: original.borderWidth,
                borderGrabWidth: original.borderGrabWidth,
                minItemHeight: original.minItemHeight,
                minItemWidth: original.minItemWidth,
                headerHeight: original.headerHeight,
                dragProxyWidth: original.dragProxyWidth,
                dragProxyHeight: original.dragProxyHeight,
            }
        }

        export const defaults: ManagerConfig.Dimensions = {
            borderWidth: 5,
            borderGrabWidth: 15,
            minItemHeight: 10,
            minItemWidth: 10,
            headerHeight: 20,
            dragProxyWidth: 300,
            dragProxyHeight: 200
        }
    }

    export interface Header {
        show: false | Side;
        popout: false | string;
        dock: string;
        maximise: false | string;
        minimise: string;
        close: string;
        tabDropdown: string;
    }

    export namespace Header {
        export function createCopy(original: Header): Header {
            return {
                show: original.show,
                popout: original.popout,
                dock: original.dock,
                close: original.close,
                maximise: original.maximise,
                minimise: original.minimise,
                tabDropdown: original.tabDropdown,
            }
        }

        export const defaults: ManagerConfig.Header = {
            show: Side.top,
            popout: 'open in new window',
            dock: 'dock',
            maximise: 'maximise',
            minimise: 'minimise',
            close: 'close',
            tabDropdown: 'additional tabs'
        }
    }

    export function isPopout(config: ManagerConfig): config is PopoutManagerConfig {
        return 'parentId' in config;
    }

    export function createCopy(config: ManagerConfig): ManagerConfig {
        if (isPopout(config)) {
            return PopoutManagerConfig.createCopy(config);
        } else {
            return Config.createCopy(config as Config);
        }
    }

    export function createRootItemConfig(managerConfig: PopoutManagerConfig): ItemConfig {
        return {
            type: ItemConfig.Type.root,
            content: managerConfig.content,
            width: 100,
            minWidth: 0,
            height: 100,
            minHeight: 0,
            id: '',
            isClosable: false,
            title: '',
            reorderEnabled: false,
            activeItemIndex: -1,
        }
    }

    export function copyOpenPopouts(original: PopoutManagerConfig[]): PopoutManagerConfig[] {
        const count = original.length;
        const result = new Array<PopoutManagerConfig>(count);
        for (let i = 0; i < count; i++) {
            result[i] = PopoutManagerConfig.createCopy(original[i]);
        }
        return result;
    }
}

export interface PopoutManagerConfig extends ManagerConfig {
    parentId: string;
    indexInParent: number;
    window: PopoutManagerConfig.Window;
}

export namespace PopoutManagerConfig {
    export interface Window {
        width: number | null,
        height: number | null,
        left: number | null,
        top: number | null,
        maximised: boolean;
    }

    export namespace Window {
        export function createCopy(original: Window): Window {
            return {
                width: original.width,
                height: original.height,
                left: original.left,
                top: original.top,
                maximised: original.maximised,
            }
        }

        export const defaults: PopoutManagerConfig.Window = {
            width: null,
            height: null,
            left: null,
            top: null,
            maximised: false,
        }
    }

    export function createCopy(original: PopoutManagerConfig): PopoutManagerConfig {
        const result: PopoutManagerConfig = {
            content: ItemConfig.copyContent(original.content),
            openPopouts: ManagerConfig.copyOpenPopouts(original.openPopouts),
            settings: ManagerConfig.Settings.createCopy(original.settings),
            dimensions: ManagerConfig.Dimensions.createCopy(original.dimensions),
            header: ManagerConfig.Header.createCopy(original.header),
            parentId: original.parentId,
            indexInParent: original.indexInParent,
            window: PopoutManagerConfig.Window.createCopy(original.window),
        }
        return result;
    }
}

export interface Config extends ManagerConfig {
    resolved: true,
}

export namespace Config {

    export function createCopy(original: Config): Config {
        const result: Config = {
            resolved: original.resolved,
            content: ItemConfig.copyContent(original.content),
            openPopouts: ManagerConfig.copyOpenPopouts(original.openPopouts),
            settings: ManagerConfig.Settings.createCopy(original.settings),
            dimensions: ManagerConfig.Dimensions.createCopy(original.dimensions),
            header: ManagerConfig.Header.createCopy(original.header),
        }
        return result;
    }
}
