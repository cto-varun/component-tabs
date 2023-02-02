import React, { useState } from 'react';
import { Tabs as AntdTabs, Alert } from 'antd';
import { useLocation } from 'react-router-dom';
import BreadCrumb from '@ivoyant/component-breadcrumb';
import './styles.css';
import plugin from 'js-plugin';
import { createBrowserHistory } from 'history';

const getValidActiveKey = (tabs, activeKey) => {
    let matchingTab = tabs.find(
        (t) =>
            t?.name &&
            t.name.toLowerCase().replace(/\s/g, '').replace('/', '-') ===
                activeKey
    );
    let validActiveKey;
    if (
        matchingTab &&
        (matchingTab?.disabled === undefined || matchingTab.disabled === false)
    ) {
        validActiveKey = activeKey;
    } else {
        matchingTab = tabs.find(
            (t) => t?.disabled === undefined || t.disabled === false
        );
        validActiveKey =
            matchingTab &&
            matchingTab?.name &&
            matchingTab.name.toLowerCase().replace(/\s/g, '').replace('/', '-');
    }
    return validActiveKey;
};

export default function Tabs(props) {
    const {
        title,
        breadcrumbs,
        active = 1,
        tabs,
        tabPosition = 'top',
        tabsType = 'line',
        bypassRouteTransition = false,
        featureFlagKey,
    } = props.component.params;
    const history = createBrowserHistory();
    const location = useLocation();
    const { pathname, hash, search } = location;
    const activeTabKey = hash && getValidActiveKey(tabs, hash.split(/[#?]/)[1]);
    const { children } = props;
    const { childComponents } = props.component;
    const [currentTabKey, setCurrentTabKey] = useState(`${active}`);

    const getChildren = (tabIndex) => {
        const childrenOfTab = [];
        childComponents.forEach((childComponent, index) => {
            if (Number(childComponent.tabIndex) === tabIndex) {
                childrenOfTab.push(
                    React.cloneElement(children[index], {
                        parentProps: props,
                        routeData: location?.state?.routeData,
                    })
                );
            }
        });
        return childrenOfTab;
    };

    const getFeatureData = (featureKey) => {
        const featureFlag = plugin.invoke('features.evaluate', featureKey);
        return featureFlag && featureFlag[0];
    };

    const getTabs = () => {
        return tabs.map(
            (
                {
                    name,
                    featureFlagKey,
                    disabled = false,
                    flagForQuickPayment = false,
                },
                index
            ) => {
                const key =
                    name &&
                    name?.toLowerCase().replace(/\s/g, '').replace('/', '-');
                const featureFlag =
                    featureFlagKey && getFeatureData(featureFlagKey);
                const featureDisabled = featureFlag && !featureFlag?.enabled;

                /* Disable adjustment and autopay tabs if in quick payment mode */
                if (
                    location?.state?.routeData?.quickPayment !== undefined &&
                    flagForQuickPayment
                ) {
                    return {};
                }
                return ({
                        label: name,
                        disabled,
                        key,
                        children: featureDisabled ? (
                            <Alert
                                message={`${name} is disabled ${featureFlag?.reasons?.length > 0
                                        ? `due to ${featureFlag?.reasons.toString()}`
                                        : ''
                                    }`}
                                type="info"
                                showIcon
                            />
                        ) : (
                            getChildren(index + 1)
                        )
                    }
                );
            }
        );
    };

    const getKeyByIndex = (tabIndex) => {
        const name = tabs[tabIndex]?.name;
        return name && name?.toLowerCase().replace(/\s/g, '').replace('/', '-');
    };

    const handleTabChange = (key) => {
        const urlAfterHash = hash && hash.split('?')[1];
        const url = urlAfterHash
            ? `${pathname}#${key}?${urlAfterHash}`
            : search
            ? `${pathname}#${key}${search}`
            : `${pathname}#${key}`;
        history.push(url, { routeData: location?.state?.routeData });
    };

    let tabFeatureFlag = null;

    if (featureFlagKey) {
        tabFeatureFlag = getFeatureData(featureFlagKey);
    }

    return (
        <>
            {breadcrumbs && title && (
                <BreadCrumb title={title} breadcrumbs={breadcrumbs} />
            )}
            {tabFeatureFlag && !tabFeatureFlag?.enabled ? (
                <Alert
                    className="payments-alert"
                    message={`${title.text} is disabled ${
                        tabFeatureFlag?.reasons?.length > 0
                            ? `due to ${tabFeatureFlag?.reasons.toString()}`
                            : ''
                    }`}
                    type="info"
                    showIconx
                />
            ) : (
                <AntdTabs
                    defaultActiveKey={
                        bypassRouteTransition
                            ? currentTabKey
                            : activeTabKey || getKeyByIndex(active - 1)
                    }
                    defaultActiveKey={activeTabKey || getKeyByIndex(active - 1)}
                    tabPosition={tabPosition}
                    type={tabsType}
                    onChange={
                        bypassRouteTransition
                            ? (k) => {
                                  setCurrentTabKey(`${k}`);
                              }
                            : handleTabChange
                    }
                    items = {getTabs()}
                >
                    
                </AntdTabs>
            )}
        </>
    );
}
