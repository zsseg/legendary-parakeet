import React, { useState, useEffect } from 'react';
import './Game.css';
// 简单的加密解密函数
const encrypt = (text) => {
    return btoa(unescape(encodeURIComponent(text)));
};

const decrypt = (text) => {
    return decodeURIComponent(escape(atob(text)));
};
// 调试控制台组件
const DebugConsole = ({ isVisible, onClose, resourceManager, buildingManager, upgradeManager, prestigeManager }) => {
    const [password, setPassword] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [resourceId, setResourceId] = useState('reading');
    const [resourceValue, setResourceValue] = useState('');
    const [buildingId, setBuildingId] = useState('bookshelf');
    const [buildingCount, setBuildingCount] = useState('');

    const authenticate = () => {
        if (password === '114514') {
            setAuthenticated(true);
        } else {
            alert('密码错误');
        }
    };

    const setResource = () => {
        const value = parseFloat(resourceValue);
        if (!isNaN(value)) {
            const resource = resourceManager.getResource(resourceId);
            if (resource) {
                resource.value = value;
                alert(`${resourceId} 已设置为 ${value}`);
            }
        }
    };

    const setBuilding = () => {
        const count = parseInt(buildingCount);
        if (!isNaN(count)) {
            const building = buildingManager.buildings.get(buildingId);
            if (building) {
                building.count = count;
                alert(`${buildingId} 数量已设置为 ${count}`);
            }
        }
    };

    const unlockAll = () => {
        // 解锁所有资源
        ['reading', 'knowledge', 'publication', 'paper'].forEach(resourceId => {
            resourceManager.unlockedResources.add(resourceId);
        });

        // 解锁所有建筑
        buildingManager.buildings.forEach((building, id) => {
            buildingManager.unlockedBuildings.add(id);
        });

        alert('已解锁所有内容和建筑');
    };

    if (!isVisible) return null;

    return (
        <div className="debug-console-overlay">
            <div className="debug-console">
                <div className="debug-header">
                    <h3>调试控制台</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                {!authenticated ? (
                    <div className="auth-section">
                        <input
                            type="password"
                            placeholder="输入调试密码"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="debug-input"
                        />
                        <button onClick={authenticate} className="debug-button">验证</button>
                    </div>
                ) : (
                    <div className="debug-controls">
                        <div className="debug-section">
                            <h4>资源设置</h4>
                            <select value={resourceId} onChange={(e) => setResourceId(e.target.value)} className="debug-select">
                                <option value="reading">读书量</option>
                                <option value="rereading">累计重置读书量</option>
                                <option value="knowledge">知识</option>
                                <option value="publication">著作</option>
                                <option value="paper">论文</option>
                            </select>
                            <input
                                type="number"
                                placeholder="数值"
                                value={resourceValue}
                                onChange={(e) => setResourceValue(e.target.value)}
                                className="debug-input"
                            />
                            <button onClick={setResource} className="debug-button">设置资源</button>
                        </div>

                        <div className="debug-section">
                            <h4>建筑设置</h4>
                            <select value={buildingId} onChange={(e) => setBuildingId(e.target.value)} className="debug-select">
                                {Array.from(buildingManager.buildings.keys()).map(id => (
                                    <option key={id} value={id}>{id}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="数量"
                                value={buildingCount}
                                onChange={(e) => setBuildingCount(e.target.value)}
                                className="debug-input"
                            />
                            <button onClick={setBuilding} className="debug-button">设置建筑</button>
                        </div>

                        <div className="debug-section">
                            <h4>快速操作</h4>
                            <button onClick={unlockAll} className="debug-button">解锁全部</button>
                            <button onClick={() => { prestigeManager.wisdom += 1000; alert('增加1000智慧'); }} className="debug-button">
                                增加智慧
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// 收益递减管理系统 - 只针对基于建筑数量的资源获取加成
class DiminishingReturnsManager {
    constructor() {
        this.buildingBasedMultipliers = new Map();
    }

    // 配置基于建筑数量的资源获取加成
    addBuildingBasedMultiplier(targetResource, baseResource, baseMultiplier = 0.01, softCap = 100, hardCap = 1000) {
        this.buildingBasedMultipliers.set(targetResource, {
            baseResource,
            baseMultiplier,
            softCap,
            hardCap
        });
    }

    // 计算基于建筑数量的加成，应用收益递减
    getBuildingBasedMultiplier(targetResource, buildingCount) {
        const config = this.buildingBasedMultipliers.get(targetResource);
        if (!config) return 1;

        // 基础线性增长
        let multiplier = 1 + (buildingCount * config.baseMultiplier);

        // 软上限机制：超过软上限后应用收益递减
        if (multiplier > config.softCap) {
            const excess = multiplier - config.softCap;
            // 使用对数函数实现平滑收益递减
            multiplier = config.softCap + Math.log10(excess + 1) * (config.hardCap - config.softCap) / 10;
        }

        // 硬上限
        return Math.min(multiplier, config.hardCap);
    }

    // 获取当前效率系数（用于UI显示）
    getEfficiencyFactor(targetResource, buildingCount) {
        const config = this.buildingBasedMultipliers.get(targetResource);
        if (!config) return 1.0;

        const currentMultiplier = this.getBuildingBasedMultiplier(targetResource, buildingCount);
        const linearMultiplier = 1 + (buildingCount * config.baseMultiplier);

        return currentMultiplier / linearMultiplier;
    }
}

// 论文系统
class PaperSystem {
    constructor(resourceManager) {
        this.resourceManager = resourceManager;
        this.isUnlocked = false;
        this.writingProgress = 0;
        this.writingTime = 60; // 基础写作时间60秒
        this.baseProbability = 0.01; // 基础概率1%
        this.isWriting = false;
        this.paperMultiplier = 0; // 每个论文提供100%加成
        this.probability = 0;
    }

    unlock() {
        if (this.isUnlocked) this.reduceWritingTime(0.02);
        this.isUnlocked = true;
        this.resourceManager.addResource('paper', '论文', 0, Infinity, 0);
    }

    startWriting() {
        if (this.isUnlocked && !this.isWriting) {
            this.isWriting = true;
            this.writingProgress = 0;
        }
    }

    tick(deltaTime) {
        if (!this.isUnlocked || !this.isWriting) return;

        this.writingProgress += deltaTime / this.writingTime;

        if (this.writingProgress >= 1) {
            this.tryCompletePaper();
            this.isWriting = false;
            this.writingProgress = 0;
        }
    }

    calc() {
        const knowledge = this.resourceManager.getResource('knowledge');
        const publication = this.resourceManager.getResource('publication');
        const baseChance = knowledge.value * publication.value;
        this.probability = this.baseProbability;

        if (baseChance > 0) {
            // 使用对数函数实现收益递减
            this.probability += Math.log(baseChance + 1) * 0.01;
        }
    }

    tryCompletePaper() {
        const knowledge = this.resourceManager.getResource('knowledge');
        const publication = this.resourceManager.getResource('publication');
        const paper = this.resourceManager.getResource('paper');

        if (!knowledge || !publication || !paper) return;

        // 计算概率：基于知识*著作，应用收益递减
        const baseChance = knowledge.value * publication.value;
        this.probability = this.baseProbability;

        if (baseChance > 0) {
            // 使用对数函数实现收益递减
            this.probability += Math.log(baseChance + 1) * 0.01;
        }
        if (this.probability >= 1) {
            paper.value += Math.floor(this.probability);
            this.updatePaperMultiplier();
        } else if (Math.random() < this.probability) {
            paper.value += 1;
            this.updatePaperMultiplier();
        }
    }

    updatePaperMultiplier() {
        const paper = this.resourceManager.getResource('paper');
        if (!paper) return;

        let multiplier = paper.value; // 每个论文100%

        // 超过10000%有收益递减
        if (multiplier > 100) { // 10000%
            const excess = multiplier - 100;
            // 使用对数函数实现收益递减
            multiplier = 100 + Math.log2(excess + 1) * 50;
        }

        // 硬上限100000%
        this.paperMultiplier = Math.min(multiplier, 1000);
    }

    getPaperMultiplier() {
        return 1 + (this.paperMultiplier / 100); // 转换为乘数
    }

    reduceWritingTime(reduction) {
        this.writingTime = Math.max(10, this.writingTime * (1 - reduction)); // 最少10秒
    }

    getWritingProgress() {
        return this.writingProgress;
    }

    isWritingInProgress() {
        return this.isWriting;
    }
}

// 资源管理器
class ResourceManager {
    constructor(diminishingReturnsManager) {
        this.resources = new Map();
        this.multipliers = new Map();
        this.unlockedResources = new Set(['reading', 'rereading']);
        this.globalEfficiency = 1;
        this.gbbplus = 1;
        this.diminishingReturnsManager = diminishingReturnsManager;
    }

    addResource(id, name, initialValue = 0, cap = Infinity, perSecond = 0, unlockRequirement = null) {
        this.resources.set(id, {
            id,
            name,
            value: initialValue,
            cap,
            perSecond,
            multipliers: {},
            unlockRequirement,
            basePerSecond: perSecond
        });
    }

    addMultiplier(multiplierId, baseValue = 1) {
        this.multipliers.set(multiplierId, baseValue);
    }

    updateResource(resourceId, multiplierId, value) {
        const resource = this.resources.get(resourceId);
        if (resource) {
            resource.multipliers[multiplierId] = value;
        }
    }

    getResourceValue(resourceId) {
        const resource = this.resources.get(resourceId);
        if (!resource) return 0;

        let multiplier = 1;
        Object.values(resource.multipliers).forEach(value => {
            multiplier *= value;
        });

        return resource.perSecond * multiplier * this.globalEfficiency;
    }

    tick(deltaTime = 1) {
        this.resources.forEach(resource => {
            if (!this.isUnlocked(resource.id)) return;

            const production = this.getResourceValue(resource.id);
            resource.value = Math.min(resource.value + production * deltaTime, resource.cap);
        });
    }

    getResource(resourceId) {
        return this.resources.get(resourceId);
    }

    getAllResources() {
        return Array.from(this.resources.values()).filter(resource =>
            this.isUnlocked(resource.id)
        );
    }

    isUnlocked(resourceId) {
        return this.unlockedResources.has(resourceId);
    }

    checkUnlocks() {
        this.resources.forEach(resource => {
            if (!this.unlockedResources.has(resource.id) && resource.unlockRequirement) {
                const reqResource = this.getResource(resource.unlockRequirement.resource);
                if (reqResource && reqResource.value >= resource.unlockRequirement.amount) {
                    this.unlockedResources.add(resource.id);
                }
            }
        });
    }

    updateGlobalEfficiency(readingAmount) {
        // 每1K读书量增加1%效率，应用收益递减
        const baseBonus = Math.floor(readingAmount / 1000) * 0.01;

        // 软上限机制：从3000%开始收益递减
        let efficiency = 1 + baseBonus;

        if (efficiency > 30) { // 3000%
            const excess = efficiency - 30;
            // 使用对数函数实现收益递减
            efficiency = 30 + Math.log10(excess + 1);
        }

        // 硬上限5000%
        this.globalEfficiency = Math.min(efficiency, 50 * (1 + this.gbbplus));

        return this.globalEfficiency;
    }

    getEfficiencyPercentage() {
        return (this.globalEfficiency - 1) * 100;
    }

    getEfficiencyProgress() {
        const current = this.getEfficiencyPercentage();
        if (current < 3000) {
            return current / 3000;
        } else if (current < 5000) {
            return 0.6 + ((current - 3000) / 2000) * 0.4;
        }
        return 1;
    }
}

// 建筑管理器
class BuildingManager {
    constructor(resourceManager) {
        this.buildings = new Map();
        this.resourceManager = resourceManager;
        this.unlockedBuildings = new Set();
        this.baseCostMultiplier = 0; // 智慧升级会增加这个值
    }

    addBuilding(id, name, baseCost, costExponent = 1.15, baseProduction = 1, outputResource = 'reading', unlockRequirement = null, conversionRate = 1) {
        this.buildings.set(id, {
            id,
            name,
            count: 0,
            baseCost,
            costExponent,
            baseProduction,
            outputResource,
            multipliers: {},
            unlockRequirement,
            conversionRate, // 知识建筑的转化率
            baseConversionRate: conversionRate
        });
    }

    updateBuilding(buildingId, multiplierId, value) {
        const building = this.buildings.get(buildingId);
        if (building) {
            building.multipliers[multiplierId] = value;
        }
    }

    getBuildingCost(buildingId) {
        const building = this.buildings.get(buildingId);
        if (!building) return Infinity;

        // 应用智慧升级的基础成本降低
        const adjustedBaseCost = building.baseCost;

        // 逐级指数提升
        return Math.floor(adjustedBaseCost * Math.pow(building.costExponent - this.baseCostMultiplier, building.count));
    }

    reduceBaseCost(reduction) {
        this.baseCostMultiplier += reduction;
    }

    getBuildingProduction(buildingId) {
        const building = this.buildings.get(buildingId);
        if (!building) return 0;

        let multiplier = 1;
        Object.values(building.multipliers).forEach(value => {
            multiplier *= value;
        });

        // 知识建筑：转化率随等级提升
        let production = building.count * building.baseProduction * multiplier;

        if (building.outputResource === 'knowledge') {
            // 知识建筑的转化率随等级提升
            const levelBonus = 1 + (building.count * 0.01); // 每级提升1%转化率
            production *= building.conversionRate * levelBonus;
        }

        // 特殊建筑：书与笔的产出受知识影响
        if (buildingId === 'penAndBook') {
            const knowledge = this.resourceManager.getResource('knowledge');
            const knowledgeBonus = knowledge ? 1 + (Math.log(knowledge.value) * Math.log(knowledge.value) * 10) : 1;
            production *= knowledgeBonus;
        }

        return production;
    }

    canBuyBuilding(buildingId, resourceId) {
        if (!this.isUnlocked(buildingId)) return false;

        const cost = this.getBuildingCost(buildingId);
        const resource = this.resourceManager.getResource(resourceId);
        return resource && resource.value >= cost;
    }

    buyBuilding(buildingId, resourceId) {
        if (this.canBuyBuilding(buildingId, resourceId)) {
            const cost = this.getBuildingCost(buildingId);
            const resource = this.resourceManager.getResource(resourceId);
            const building = this.buildings.get(buildingId);

            if (resource && building) {
                resource.value -= cost;
                building.count++;
                return true;
            }
        }
        return false;
    }

    getAllBuildings() {
        return Array.from(this.buildings.values()).filter(building =>
            this.isUnlocked(building.id)
        );
    }

    isUnlocked(buildingId) {
        return this.unlockedBuildings.has(buildingId);
    }

    checkUnlocks() {
        this.buildings.forEach(building => {
            if (!this.unlockedBuildings.has(building.id) && building.unlockRequirement) {
                const reqResource = this.resourceManager.getResource(building.unlockRequirement.resource);
                if (reqResource && reqResource.value >= building.unlockRequirement.amount) {
                    this.unlockedBuildings.add(building.id);
                }
            }
        });
    }
}

// 升级管理器
class UpgradeManager {
    constructor(resourceManager, buildingManager) {
        this.upgrades = new Map();
        this.resourceManager = resourceManager;
        this.buildingManager = buildingManager;
        this.purchasedUpgrades = new Set();
    }

    addUpgrade(id, name, cost, targetType, targetId, multiplierId, multiplierValue, unlockRequirement = null, costResource = 'knowledge') {
        this.upgrades.set(id, {
            id,
            name,
            cost,
            targetType, // 'resource' or 'building'
            targetId,
            multiplierId,
            multiplierValue,
            purchased: false,
            unlockRequirement,
            costResource
        });
    }

    canBuyUpgrade(upgradeId, resourceId = null) {
        const upgrade = this.upgrades.get(upgradeId);
        if (!upgrade || upgrade.purchased) return false;

        if (upgrade.unlockRequirement) {
            const reqResource = this.resourceManager.getResource(upgrade.unlockRequirement.resource);
            if (!reqResource || reqResource.value < upgrade.unlockRequirement.amount) {
                return false;
            }
        }

        const costResource = resourceId || upgrade.costResource;
        const resource = this.resourceManager.getResource(costResource);
        return resource && resource.value >= upgrade.cost;
    }

    buyUpgrade(upgradeId, resourceId = null, isbought = 0) {
        const costResource = resourceId || this.upgrades.get(upgradeId)?.costResource;
        if (this.canBuyUpgrade(upgradeId, costResource) || isbought) {
            const upgrade = this.upgrades.get(upgradeId);
            const resource = this.resourceManager.getResource(costResource);

            if (upgrade && resource || isbought) {
                resource.value -= isbought ? 0 : upgrade.cost;
                upgrade.purchased = true;
                this.purchasedUpgrades.add(upgradeId);

                // 应用升级效果
                if (upgrade.targetType === 'resource') {
                    this.resourceManager.updateResource(upgrade.targetId, upgrade.multiplierId, upgrade.multiplierValue);
                } else if (upgrade.targetType === 'building') {
                    this.buildingManager.updateBuilding(upgrade.targetId, upgrade.multiplierId, upgrade.multiplierValue);
                }

                return true;
            }
        }
        return false;
    }

    getAvailableUpgrades() {
        return Array.from(this.upgrades.values()).filter(upgrade =>
            !upgrade.purchased &&
            (!upgrade.unlockRequirement ||
                (this.resourceManager.getResource(upgrade.unlockRequirement.resource)?.value >= upgrade.unlockRequirement.amount ? (upgrade.unlockRequirement.amount = 0, true) : false)) &&
            !(this.resourceManager.getResource(upgrade.unlockRequirement.resource)?.multiplier === 0.02 && this.resourceManager.getResource(upgrade.unlockRequirement.resource)?.level === 1)
        );
    }

}

// 升学系统
class PrestigeManager {
    constructor(resourceManager) {
        this.resourceManager = resourceManager;
        this.wisdom = 0;
        this.globalMultipliers = new Map();
        this.totalReadingReset = 0;
        this.wisdomUpgrades = new Map();
    }

    canAscend() {
        const publications = this.resourceManager.getResource('publication');
        return publications && publications.value >= 1;
    }

    ascend() {
        if (!this.canAscend()) return 0;

        const publications = this.resourceManager.getResource('publication');
        const wisdomGained = publications.value;

        this.wisdom += wisdomGained;

        return wisdomGained;
    }

    addGlobalMultiplier(multiplierId, baseValue = 1) {
        this.globalMultipliers.set(multiplierId, baseValue);
    }

    updateGlobalMultiplier(multiplierId, value) {
        this.globalMultipliers.set(multiplierId, value);
    }

    getGlobalMultiplier(multiplierId) {
        return this.globalMultipliers.get(multiplierId) || 1;
    }

    addWisdomUpgrade(id, name, baseCost, multiplier, target, effect) {
        this.wisdomUpgrades.set(id, {
            id,
            name,
            baseCost,
            level: 0,
            multiplier,
            target,
            effect
        });
    }

    getWisdomUpgradeCost(upgradeId) {
        const upgrade = this.wisdomUpgrades.get(upgradeId);
        if (!upgrade) return Infinity;

        return Math.floor(upgrade.baseCost * Math.pow(2, upgrade.level));
    }

    canBuyWisdomUpgrade(upgradeId) {
        const upgrade = this.wisdomUpgrades.get(upgradeId);
        if (this.wisdomUpgrades.get(upgradeId).multiplier === 0.02 && this.wisdomUpgrades.get(upgradeId).level !== 0) return false;
        return upgrade && this.wisdom >= this.getWisdomUpgradeCost(upgradeId);
    }

    buyWisdomUpgrade(upgradeId, buildingManager, paperSystem) {
        if (this.canBuyWisdomUpgrade(upgradeId)) {
            const upgrade = this.wisdomUpgrades.get(upgradeId);
            const cost = this.getWisdomUpgradeCost(upgradeId);

            this.wisdom -= cost;
            upgrade.level++;

            // 应用升级效果
            if (upgrade.effect === 'costReduction') {
                buildingManager.reduceBaseCost(0.02);
            } else if (upgrade.effect === 'paperProbability') {
                // 论文概率提升
                paperSystem.baseProbability *= upgrade.multiplier;
            } else if (upgrade.effect === 'paperMultiplier') {
                // 论文加成提升
                // 这个效果已经在paperSystem中处理
            } else if (upgrade.effect === 'unlockPaper') {
                paperSystem.unlock();
            }

            return true;
        }
        return false;
    }

    getReadingResetBonus() {
        // 每1K读书量增加10%效率
        return Math.floor(this.totalReadingReset / 1000) * 0.1;
    }

    getAllWisdomUpgrades() {
        return Array.from(this.wisdomUpgrades.values());
    }
}

// React 游戏组件
const Game = ({ onBackToMain }) => {
    const [resources, setResources] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [upgrades, setUpgrades] = useState([]);
    const [wisdomUpgrades, setWisdomUpgrades] = useState([]);
    const [gameTime, setGameTime] = useState(0);
    const [showEfficiencyInfo, setShowEfficiencyInfo] = useState(false);
    const [showDebugConsole, setShowDebugConsole] = useState(false);
    const [paperWritingProgress, setPaperWritingProgress] = useState(0);
    const [isWritingPaper, setIsWritingPaper] = useState(false);
    const [buildingEfficiency, setBuildingEfficiency] = useState({});

    // 初始化游戏管理器
    const [diminishingReturnsManager] = useState(new DiminishingReturnsManager());
    const [resourceManager] = useState(new ResourceManager(diminishingReturnsManager));
    const [buildingManager] = useState(new BuildingManager(resourceManager));
    const [upgradeManager] = useState(new UpgradeManager(resourceManager, buildingManager));
    const [prestigeManager] = useState(new PrestigeManager(resourceManager));
    const [paperSystem] = useState(new PaperSystem(resourceManager));

    // 修改 saveGameData 函数
    const saveGameData = () => {
        try {
            // 确保所有基础资源都存在
            const requiredResources = ['reading', 'rereading', 'knowledge', 'publication'];
            requiredResources.forEach(resourceId => {
                if (!resourceManager.getResource(resourceId)) {
                    const names = {
                        'reading': '读书量',
                        'rereading': '累计重置读书量',
                        'knowledge': '知识',
                        'publication': '著作'
                    };
                    resourceManager.addResource(resourceId, names[resourceId], 0, Infinity, 0);
                }
            });

            // 确保 rereading 在解锁集合中
            resourceManager.unlockedResources.add('rereading');

            const gameData = {
                resources: resourceManager.getAllResources().map(resource => ({
                    id: resource.id,
                    name: resource.name,
                    value: resource.value,
                    perSecond: resource.perSecond,
                    cap: resource.cap,
                    basePerSecond: resource.basePerSecond
                })),
                buildings: Array.from(buildingManager.buildings.values()).map(building => ({
                    id: building.id,
                    count: building.count,
                    name: building.name
                })),
                upgrades: Array.from(upgradeManager.purchasedUpgrades),
                wisdomUpgrades: Array.from(prestigeManager.wisdomUpgrades.values()).map(upgrade => ({
                    id: upgrade.id,
                    level: upgrade.level
                })),
                unlockedResources: Array.from(resourceManager.unlockedResources),
                unlockedBuildings: Array.from(buildingManager.unlockedBuildings),
                paperSystem: {
                    isUnlocked: paperSystem.isUnlocked,
                    paperValue: resourceManager.getResource('paper')?.value || 0
                },
                prestige: {
                    wisdom: prestigeManager.wisdom,
                    totalReadingReset: prestigeManager.totalReadingReset
                },
                gameTime: gameTime,
                saveTime: new Date().toISOString()
            };
            localStorage.setItem('libraryIncrementalSave', JSON.stringify(gameData));
        } catch (error) {
            console.error('保存游戏数据失败:', error);
        }
    };

    // 修改 loadGameData 函数
    const loadGameData = () => {
        try {
            const savedData = localStorage.getItem('libraryIncrementalSave');

            if (savedData) {
                const gameData = JSON.parse(savedData);

                // 先确保所有基础资源都已添加
                const requiredResources = ['reading', 'rereading', 'knowledge', 'publication'];
                requiredResources.forEach(resourceId => {
                    if (!resourceManager.getResource(resourceId)) {
                        const names = {
                            'reading': '读书量',
                            'rereading': '累计重置读书量',
                            'knowledge': '知识',
                            'publication': '著作'
                        };
                        resourceManager.addResource(resourceId, names[resourceId], 0, Infinity, 0);
                    }
                });

                // 恢复资源数据
                if (gameData.resources) {
                    gameData.resources.forEach(resourceData => {
                        console.log('正在恢复资源:', resourceData.id, resourceData.value);
                        const resource = resourceManager.getResource(resourceData.id);
                        if (resource) {
                            resource.value = resourceData.value || 0;
                            resource.perSecond = resourceData.perSecond || 0;
                            resource.cap = resourceData.cap || Infinity;

                            if (resourceData.id === 'rereading') {
                                // 更新全局效率
                                resourceManager.updateGlobalEfficiency(resourceData.value);
                            }
                        } else {
                            console.warn('找不到资源:', resourceData.id);
                            // 如果资源不存在，创建它
                            if (resourceData.id === 'rereading') {
                                resourceManager.addResource('rereading', '累计重置读书量', resourceData.value || 0, Infinity, 0);
                            }
                        }
                    });
                }

                // 恢复解锁状态
                if (gameData.unlockedResources) {
                    resourceManager.unlockedResources.clear();
                    gameData.unlockedResources.forEach(resourceId => {
                        resourceManager.unlockedResources.add(resourceId);
                    });
                    // 确保 rereading 总是解锁的
                    resourceManager.unlockedResources.add('rereading');
                }

                // 其他恢复逻辑保持不变...
                console.log('游戏数据已从本地存储加载');
            }
        } catch (error) {
            console.error('加载游戏数据失败:', error);
        }
    };

    // 修改 resetGameData 函数，确保 rereading 被正确重置
    const resetGameData = () => {
        if (window.confirm('确定要重置游戏吗？这将清除所有进度，包括资源、建筑、升级和智慧点数，此操作不可撤销！')) {
            try {
                // 清空本地存储
                localStorage.removeItem('libraryIncrementalSave');

                // 重置所有资源
                resourceManager.resources = new Map();
                resourceManager.addResource('reading', '读书量', 0, Infinity, 0);
                resourceManager.addResource('rereading', '累计重置读书量', 0, Infinity, 0);
                resourceManager.addResource('knowledge', '知识', 0, Infinity, 0, { resource: 'reading', amount: 1000 });
                resourceManager.addResource('publication', '著作', 0, Infinity, 0, { resource: 'knowledge', amount: 1000 });
                resourceManager.gbbplus = 1;

                // 重置所有建筑
                buildingManager.buildings.forEach(building => {
                    building.count = 0;
                });

                // 重置所有升级
                upgradeManager.purchasedUpgrades.clear();
                upgradeManager.upgrades.forEach(upgrade => {
                    upgrade.purchased = false;
                });

                // 重置智慧升级
                prestigeManager.wisdomUpgrades.forEach(upgrade => {
                    upgrade.level = 0;
                });

                // 重置智慧点数
                prestigeManager.wisdom = 0;
                prestigeManager.totalReadingReset = 0;

                // 重置论文系统
                paperSystem.isUnlocked = false;
                paperSystem.writingProgress = 0;
                paperSystem.isWriting = false;
                paperSystem.paperMultiplier = 0;

                // 重置解锁状态
                resourceManager.unlockedResources.clear();
                resourceManager.unlockedResources.add('reading');
                resourceManager.unlockedResources.add('rereading'); // 确保 rereading 被解锁

                buildingManager.unlockedBuildings.clear();
                buildingManager.unlockedBuildings.add('bookshelf');

                // 重置全局效率
                resourceManager.globalEfficiency = 1;

                // 重置游戏时间
                setGameTime(0);

                // 重置论文资源（如果存在）
                const paperResource = resourceManager.getResource('paper');
                if (paperResource) {
                    paperResource.value = 0;
                    paperResource.perSecond = 0;
                }

                // 更新游戏状态
                updateGameState();

                alert('游戏已重置！');
            } catch (error) {
                console.error('重置游戏数据失败:', error);
                alert('重置失败，请重试');
            }
        }
    };
    // 导出游戏数据
    const exportGameData = () => {
        try {
            const gameData = {
                resources: resourceManager.getAllResources().map(resource => ({
                    id: resource.id,
                    value: resource.value,
                    perSecond: resource.perSecond
                })),
                buildings: Array.from(buildingManager.buildings.values()).map(building => ({
                    id: building.id,
                    count: building.count
                })),
                upgrades: Array.from(upgradeManager.purchasedUpgrades),
                wisdomUpgrades: Array.from(prestigeManager.wisdomUpgrades.values()).map(upgrade => ({
                    id: upgrade.id,
                    level: upgrade.level
                })),
                paperSystem: {
                    isUnlocked: paperSystem.isUnlocked,
                    paperValue: resourceManager.getResource('paper')?.value || 0
                },
                prestige: {
                    wisdom: prestigeManager.wisdom,
                    totalReadingReset: prestigeManager.totalReadingReset
                },
                gameTime: gameTime,
                exportTime: new Date().toISOString()
            };

            const encryptedData = encrypt(JSON.stringify(gameData));
            const blob = new Blob([encryptedData], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'library_incremental_save.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert('游戏数据已导出为 library_incremental_save.txt 文件');
        } catch (error) {
            console.error('导出游戏数据失败:', error);
            alert('导出失败，请重试');
        }
    };

    // 导入游戏数据
    const importGameData = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const encryptedData = e.target.result;
                const decryptedData = decrypt(encryptedData);
                const gameData = JSON.parse(decryptedData);

                // 验证数据格式
                if (!gameData.resources || !gameData.buildings) {
                    throw new Error('无效的游戏数据文件');
                }

                // 保存到本地存储
                localStorage.setItem('libraryIncrementalSave', JSON.stringify(gameData));

                // 重新加载游戏数据，而不是刷新整个页面
                loadGameData();

                // 强制更新游戏状态
                updateGameState();

                alert('游戏数据导入成功！');
            } catch (error) {
                console.error('导入游戏数据失败:', error);
                alert('导入失败，文件可能已损坏或格式不正确');
            }
        };
        reader.readAsText(file);

        // 重置文件输入
        event.target.value = '';
    };

    // 初始化游戏数据
    useEffect(() => {
        // 配置基于建筑数量的资源获取加成（应用收益递减）
        diminishingReturnsManager.addBuildingBasedMultiplier('reading', 'bookshelf', 0.05, 50, 200);
        diminishingReturnsManager.addBuildingBasedMultiplier('knowledge', 'notebook', 0.02, 30, 100);

        // 添加资源 - 去除资源上限，减缓资源获取速度
        resourceManager.addResource('reading', '读书量', 0, Infinity, 0);
        resourceManager.addResource('rereading', '累计重置读书量', 0, Infinity, 0);
        resourceManager.addResource('knowledge', '知识', 0, Infinity, 0, { resource: 'knowledge', amount: 0.0001 }); // 降低解锁要求
        resourceManager.addResource('publication', '著作', 0, Infinity, 0, { resource: 'knowledge', amount: 10000000 }); // 降低解锁要求

        // 添加乘区
        resourceManager.addMultiplier('efficiency', 1);
        resourceManager.addMultiplier('production', 1);
        resourceManager.addMultiplier('wisdom', 1);

        // 添加建筑 - 读书量建筑 (价格大幅下调，增加建筑数量)
        buildingManager.addBuilding('bookshelf', '书架', 10, 1.15, 0.1, 'reading');
        buildingManager.addBuilding('readingRoom', '阅读室', 100, 1.18, 2, 'reading', { resource: 'reading', amount: 100 });
        buildingManager.addBuilding('library', '图书馆', 1000, 1.2, 10, 'reading', { resource: 'reading', amount: 500 });
        buildingManager.addBuilding('ebookPlatform', '电子书平台', 500000, 1.22, 100, 'reading', { resource: 'reading', amount: 1000000 });
        buildingManager.addBuilding('dataCenter', '数据中心', 1000000000, 1.25, 2000, 'reading', { resource: 'knowledge', amount: 500 });
        buildingManager.addBuilding('digitalLibrary', '数字图书馆', 5000000000, 1.28, 100000000000, 'reading', { resource: 'knowledge', amount: 20000 });
        buildingManager.addBuilding('aiReader', 'AI阅读助手', 250000000000000, 1.5, 10000000000000, 'reading', { resource: 'knowledge', amount: 1000000 });

        // 添加建筑 - 知识建筑 (价格下调，转化率降低)
        buildingManager.addBuilding('notebook', '笔记本', 1000000, 1.16, 0.01, 'knowledge', { resource: 'reading', amount: 200000 }, 0.001);
        buildingManager.addBuilding('blogPlatform', '博客平台', 30, 1.18, 0.05, 'knowledge', { resource: 'knowledge', amount: 10 }, 0.01);
        buildingManager.addBuilding('school', '学校', 500, 1.2, 0.2, 'knowledge', { resource: 'knowledge', amount: 200 }, 0.2);
        buildingManager.addBuilding('researchInstitute', '研究所', 25000, 1.22, 1, 'knowledge', { resource: 'knowledge', amount: 1000 }, 1);
        buildingManager.addBuilding('university', '大学', 1000000, 1.25, 6, 'knowledge', { resource: 'knowledge', amount: 5000 }, 3);
        buildingManager.addBuilding('thinkTank', '智库', 500000000, 1.28, 50, 'knowledge', { resource: 'knowledge', amount: 20000 }, 10);

        // 特殊建筑 - 著作建筑 (价格下调)
        buildingManager.addBuilding('penAndBook', '书与笔', 10000000, 2.0, 0.00001, 'publication', { resource: 'knowledge', amount: 5000 });

        // 修改普通升级 - 提高价格增长率
        upgradeManager.addUpgrade('upgrade00', '加快知识获取', 1, 'resource', 'knowledge', 'xx0', 2, { resource: 'knowledge', amount: 0.0001 }, 'knowledge');
        upgradeManager.addUpgrade('upgrade01', '快速知识获取', 100, 'resource', 'knowledge', 'xx1', 5, { resource: 'knowledge', amount: 50 }, 'knowledge');
        upgradeManager.addUpgrade('upgrade02', '高效知识获取', 1000, 'resource', 'knowledge', 'xxw', 6, { resource: 'knowledge', amount: 500 }, 'knowledge');
        upgradeManager.addUpgrade('upgrade03', '新兴知识获取', 4000, 'resource', 'knowledge', 'xx3', 7, { resource: 'knowledge', amount: 2000 }, 'knowledge');
        upgradeManager.addUpgrade('upgrade04', '卓越知识获取', 100000, 'resource', 'knowledge', 'xx4', 8, { resource: 'knowledge', amount: 40000 }, 'knowledge');
        upgradeManager.addUpgrade('upgrade1', '高效阅读法', 150, 'building', 'bookshelf', 'production11', 150000, { resource: 'knowledge', amount: 50 }, 'knowledge');
        upgradeManager.addUpgrade('upgrade2', '速读技巧', 350, 'resource', 'reading', 'production22', 10, { resource: 'knowledge', amount: 100 }, 'knowledge');
        upgradeManager.addUpgrade('upgrade3', '数字阅读室', 800, 'building', 'readingRoom', 'production33', 20000, { resource: 'knowledge', amount: 500 }, 'knowledge');
        upgradeManager.addUpgrade('upgrade4', '云计算', 3000, 'building', 'dataCenter', 'production44', 300000, { resource: 'knowledge', amount: 1000 }, 'knowledge');
        upgradeManager.addUpgrade('upgrade5', '知识管理系统', 8000, 'building', 'notebook', 'conversionRate', 10000, { resource: 'knowledge', amount: 5000 }, 'knowledge');
        upgradeManager.addUpgrade('upgrade6', '学术网络', 10000, 'building', 'researchInstitute', 'production55', 2, { resource: 'knowledge', amount: 9000 }, 'knowledge');
        upgradeManager.addUpgrade('upgrade7', '写作灵感', 80000, 'building', 'penAndBook', 'production66', 3, { resource: 'knowledge', amount: 40000 }, 'knowledge');
        upgradeManager.addUpgrade('upgrade8', '论文写作加速', 200000, 'special', 'paper', 'writingTime', 0.5, { resource: 'knowledge', amount: 100000 }, 'knowledge');
        upgradeManager.addUpgrade('upgrade9', '书架优化', 500000, 'building', 'bookshelf', 'production77', 15000, { resource: 'knowledge', amount: 200000 }, 'knowledge');
        upgradeManager.addUpgrade('upgrade10', '阅读室升级', 1200000, 'building', 'readingRoom', 'production88', 18000000, { resource: 'knowledge', amount: 500000 }, 'knowledge');
        upgradeManager.addUpgrade('upgrade11', '书架协同效应', 5500000, 'special', 'bookshelf', 'synergy', 1.3, { resource: 'knowledge', amount: 500000 }, 'knowledge');
        upgradeManager.addUpgrade('upgrade12', '笔记本网络', 10000000, 'special', 'notebook', 'network', 1.5, { resource: 'knowledge', amount: 1000000 }, 'knowledge');

        // 修改花费阅读量的升级 - 提高价格增长率
        upgradeManager.addUpgrade('reading_upgrade1', '专注力训练', 80, 'resource', 'reading', 'production1', 1.5, { resource: 'reading', amount: 50 }, 'reading');
        upgradeManager.addUpgrade('reading_upgrade2', '阅读环境改善', 1250, 'resource', 'reading', 'production2', 3, { resource: 'reading', amount: 300 }, 'reading');
        upgradeManager.addUpgrade('reading_upgrade3', '阅读工具升级', 60000, 'building', 'bookshelf', 'production2', 100, { resource: 'reading', amount: 8000 }, 'reading');
        upgradeManager.addUpgrade('reading_upgrade4', '阅读计划优化', 200000, 'resource', 'reading', 'production3', 2, { resource: 'reading', amount: 100000 }, 'reading');
        upgradeManager.addUpgrade('reading_upgrade5', '阅读习惯养成', 400000, 'building', 'readingRoom', 'production3', 2000, { resource: 'reading', amount: 300000 }, 'reading');
        upgradeManager.addUpgrade('reading_upgrade6', '阅读效率突破', 10000000, 'resource', 'reading', 'production3', 10, { resource: 'reading', amount: 1000000 }, 'reading');
        upgradeManager.addUpgrade('reading_upgrade7', '阅读方法创新', 4250000000, 'building', 'library', 'production3', 8000, { resource: 'reading', amount: 425000000 }, 'reading');
        upgradeManager.addUpgrade('reading_upgrade8', '阅读技术革命', 1000000000000, 'resource', 'reading', 'production3', 250, { resource: 'reading', amount: 100000000000 }, 'reading');
        upgradeManager.addUpgrade('reading_upgrade9', '阅读平台改变', 1000000000000000, 'building', 'ebookPlatform', 'production3', 30000, { resource: 'reading', amount: 100000000000000 }, 'reading');

        // 添加智慧升级
        prestigeManager.addWisdomUpgrade('wisdom1', '阅读智慧 I', 1, 1.1, 'readingMultiplier', 'productionaa');
        prestigeManager.addWisdomUpgrade('wisdom2', '知识智慧 I', 20, 1.1, 'knowledgeMultiplier', 'productionaa');
        prestigeManager.addWisdomUpgrade('wisdom3', '著作智慧 I', 400, 1.1, 'publicationMultiplier', 'productionaa');
        prestigeManager.addWisdomUpgrade('wisdom4', '成本优化 I', 10, 0.02, 'costMultiplier', 'costReduction');
        prestigeManager.addWisdomUpgrade('wisdom5', '成本优化 II', 200, 0.02, 'costMultiplier', 'costReduction');
        prestigeManager.addWisdomUpgrade('wisdom6', '成本优化 III', 40000, 0.02, 'costMultiplier', 'costReduction');
        prestigeManager.addWisdomUpgrade('wisdom7', '成本优化 IV', 8000000, 0.02, 'costMultiplier', 'costReduction');
        prestigeManager.addWisdomUpgrade('wisdom8', '成本优化 V', 160000000, 0.02, 'costMultiplier', 'costReduction');
        prestigeManager.addWisdomUpgrade('wisdom9', '论文系统', 300, 1, 'paperSystem', 'unlockPaper');
        prestigeManager.addWisdomUpgrade('wisdom10', '论文质量', 9000, 1.3, 'paperQuality', 'paperProbability');
        prestigeManager.addWisdomUpgrade('wisdom11', '论文影响', 1200000, 1.3, 'paperImpact', 'paperMultiplier');

        // 初始化全局乘数
        prestigeManager.addGlobalMultiplier('readingMultiplier', 1);
        prestigeManager.addGlobalMultiplier('knowledgeMultiplier', 1);
        prestigeManager.addGlobalMultiplier('publicationMultiplier', 1);

        // 初始解锁书架
        buildingManager.unlockedBuildings.add('bookshelf');

        // 在所有初始化完成后，再加载保存的数据（只调用一次）
        loadGameData();

        updateGameState();
    }, []);

    // 游戏主循环
    useEffect(() => {
        const gameLoop = setInterval(() => {
            resourceManager.tick(0.1);
            paperSystem.tick(0.1);
            updateBuildingProduction();
            resourceManager.checkUnlocks();
            buildingManager.checkUnlocks();
            paperSystem.calc();

            // 更新论文写作进度
            if (paperSystem.isWritingInProgress()) {
                setPaperWritingProgress(paperSystem.getWritingProgress());
                setIsWritingPaper(true);
            } else {
                setIsWritingPaper(false);
            }

            // 更新建筑效率显示
            updateBuildingEfficiency();

            setGameTime(time => time + 1);
            updateGameState();
            // 每次更新后保存游戏数据
            saveGameData();
        }, 100);

        return () => clearInterval(gameLoop);
    }, []);

    const updateBuildingProduction = () => {
        // 先重置每秒产出
        resourceManager.resources.forEach(resource => {
            resource.perSecond = resource.basePerSecond;
        });

        // 应用建筑产出
        buildingManager.getAllBuildings().forEach(building => {
            const production = buildingManager.getBuildingProduction(building.id);
            const resource = resourceManager.getResource(building.outputResource);
            if (resource) {
                // 应用全局智慧乘区和论文乘区
                const globalMultiplier = prestigeManager.getGlobalMultiplier(`${building.outputResource}Multiplier`);
                const paperMultiplier = paperSystem.getPaperMultiplier();
                resource.perSecond += production * globalMultiplier * paperMultiplier;
            }
        });

        // 应用基于建筑数量的加成（应用收益递减）
        const bookshelfCount = buildingManager.buildings.get('bookshelf')?.count || 0;
        const notebookCount = buildingManager.buildings.get('notebook')?.count || 0;

        const readingMultiplier = diminishingReturnsManager.getBuildingBasedMultiplier('reading', bookshelfCount);
        const knowledgeMultiplier = diminishingReturnsManager.getBuildingBasedMultiplier('knowledge', notebookCount);

        const readingResource = resourceManager.getResource('reading');
        const knowledgeResource = resourceManager.getResource('knowledge');

        if (readingResource && resourceManager.getResource('reading').value >= 5500000) {
            readingResource.perSecond *= readingMultiplier;
        }
        if (knowledgeResource) {
            knowledgeResource.perSecond *= knowledgeMultiplier;
        }

        // 更新全局效率
        const reading = resourceManager.getResource('rereading');
        if (reading) {
            resourceManager.updateGlobalEfficiency(prestigeManager.totalReadingReset + reading.value);
        }
    };

    const updateBuildingEfficiency = () => {
        const bookshelfCount = buildingManager.buildings.get('bookshelf')?.count || 0;
        const notebookCount = buildingManager.buildings.get('notebook')?.count || 0;

        const readingEfficiency = diminishingReturnsManager.getEfficiencyFactor('reading', bookshelfCount);
        const knowledgeEfficiency = diminishingReturnsManager.getEfficiencyFactor('knowledge', notebookCount);

        setBuildingEfficiency({
            reading: readingEfficiency,
            knowledge: knowledgeEfficiency
        });
    };

    const updateGameState = () => {
        setResources(resourceManager.getAllResources());
        setBuildings(buildingManager.getAllBuildings());
        setUpgrades(upgradeManager.getAvailableUpgrades());
        setWisdomUpgrades(prestigeManager.getAllWisdomUpgrades());
    };

    const manualRead = () => {
        const reading = resourceManager.getResource('reading');
        if (reading) {
            const globalMultiplier = prestigeManager.getGlobalMultiplier('readingMultiplier');
            const paperMultiplier = paperSystem.getPaperMultiplier();
            reading.value += 1 * globalMultiplier * resourceManager.globalEfficiency * paperMultiplier;
            updateGameState();
        }
    };

    const resetReading = () => {
        if (window.confirm('是否重置读书量？重置后将获得全局生产加成')) {
            const reading = resourceManager.getResource('reading');
            const rereading = resourceManager.getResource('rereading');
            if (reading) {
                rereading.value += reading.value;
                reading.value = 0;
                updateGameState();
            }
        }
    };

    const startPaperWriting = () => {
        if (paperSystem.isUnlocked && !paperSystem.isWritingInProgress()) {
            paperSystem.startWriting();
            setIsWritingPaper(true);
        }
    };

    const buyBuilding = (buildingId) => {
        const building = buildingManager.buildings.get(buildingId);
        let resourceId = 'reading';

        if (building.id === 'notebook') {
            resourceId = 'reading'; // 知识建筑消耗读书量
        } else if (building.outputResource !== 'reading') {
            resourceId = 'knowledge'; // 书与笔消耗知识
        }

        if (buildingManager.buyBuilding(buildingId, resourceId)) {
            updateGameState();
        }
    };
    const buyBuildingAll = (buildingId) => {
        const building = buildingManager.buildings.get(buildingId);
        let resourceId = 'reading';

        if (building.id === 'notebook') {
            resourceId = 'reading'; // 知识建筑消耗读书量
        } else if (building.outputResource !== 'reading') {
            resourceId = 'knowledge'; // 书与笔消耗知识
        }

        while (buildingManager.buyBuilding(buildingId, resourceId)) {
            updateGameState();
        }
    };

    const getState = (upgrade) => {
        return upgrade.multiplier !== 0.02 ? "等级" + String(upgrade.level) : upgrade.level === 0 ? ("未购买") : ("已购买");
    }

    const buyUpgrade = (upgradeId, isbought = 0) => {
        const upgrade = upgradeManager.upgrades.get(upgradeId);
        const resourceId = upgrade?.costResource || 'knowledge';

        if (upgradeManager.buyUpgrade(upgradeId, resourceId, isbought)) {
            // 特殊升级处理
            if (upgradeId === 'upgrade8') {
                paperSystem.reduceWritingTime(0.5);
            }
            updateGameState();
        }
    };

    const buyWisdomUpgrade = (upgradeId) => {
        if (prestigeManager.buyWisdomUpgrade(upgradeId, buildingManager, paperSystem)) {
            updateGameState();
        }
    };

    const ascend = () => {
        const wisdomGained = prestigeManager.ascend();
        if (wisdomGained > 0) {
            // 重置游戏状态但保留智慧
            resourceManager.gbbplus += Math.sqrt(Math.log(wisdomGained));
            resetGame();
            alert(`升学成功！获得 ${wisdomGained} 点智慧！`);
        }
    };

    const resetGame = () => {
        // 重置资源（除了论文）
        resourceManager.resources.multipliers = new Map();
        resourceManager.globalEfficiency = 1;
        resourceManager.resources.forEach(resource => {
            if (resource.id !== 'paper') {
                resource.value = 0;
                resource.perSecond = resource.basePerSecond;
            }
        });

        // 重置建筑
        buildingManager.buildings.forEach(building => {
            building.count = 0;
        });

        // 重置升级（除了智慧升级）
        upgradeManager.purchasedUpgrades.clear();
        upgradeManager.upgrades.forEach(upgrade => {
            upgrade.purchased = false;
        });

        // 重新解锁基础资源
        resourceManager.unlockedResources.clear();
        resourceManager.unlockedResources.add('reading');
        resourceManager.unlockedResources.add('rereading'); // 确保 rereading 被解锁

        buildingManager.unlockedBuildings.clear();
        buildingManager.unlockedBuildings.add('bookshelf');

        updateGameState();
    };

    const formatNumber = (num) => {
        if (num == null) return 0;
        if (num >= 10000000000000000000) {
            return num.toExponential(3);
        } else if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toFixed(3);
    };

    return (
        <div className="game-container">
            <header className="game-header">
                <div className="header-left">
                    <button className="read-button" onClick={onBackToMain}>
                        ← 返回主站
                    </button>
                </div>
                <div className="game-stats">
                    {prestigeManager.wisdom > 0 && (<div className="wisdom-points">智慧: {formatNumber(prestigeManager.wisdom)}</div>)}
                    <div
                        className="efficiency-display"
                        onMouseEnter={() => setShowEfficiencyInfo(true)}
                        onMouseLeave={() => setShowEfficiencyInfo(false)}
                    >
                        全局效率:{(resourceManager.getEfficiencyPercentage() + 100).toFixed(2)}%
                        {showEfficiencyInfo && (
                            <div className="efficiency-tooltip">
                                <div>重置阅读量时每1K读书量增加1%效率</div>
                                <div>3000%后收益递减</div>
                                <div>5000%硬上限</div>
                                <div>可以被智慧增益</div>
                                <div className="efficiency-bar">
                                    <div
                                        className="efficiency-fill"
                                        style={{ width: `${resourceManager.getEfficiencyProgress() * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="save-buttons">
                        <button className="save-button" onClick={exportGameData}>
                            导出
                        </button>
                        <label className="import-button">
                            导入
                            <input
                                type="file"
                                accept=".txt"
                                onChange={importGameData}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                    <button className="reset-button" onClick={resetGameData}>
                        重置
                    </button>
                    <button
                        className="debug-toggle"
                        onClick={() => setShowDebugConsole(true)}
                    >
                        调试
                    </button>
                </div>
            </header>

            <div className="game-content">
                {/* 手动操作区域 */}
                <section className="manual-section">
                    <button className="read-button" onClick={manualRead}>
                        📖 读书
                    </button>
                    {resourceManager.getResource('reading')?.value > 1000 && (
                        <button className="read-button" onClick={resetReading}>
                            重置读书量
                        </button>
                    )}
                    {paperSystem.isUnlocked && (
                        <button
                            className={`paper-button ${isWritingPaper ? 'writing' : ''}`}
                            onClick={startPaperWriting}
                            disabled={isWritingPaper}
                        >
                            {isWritingPaper ? `撰写论文中... ${(paperWritingProgress * 100).toFixed(1)}%,当前成功率 ${paperSystem.probability.toFixed(6) * 100}%` : '撰写论文'}
                        </button>
                    )}

                    {resourceManager.isUnlocked('publication') && (
                        <button
                            className="ascend-button"
                            onClick={ascend}
                            disabled={!prestigeManager.canAscend()}
                        >
                            升学 (需要至少1本著作)
                        </button>
                    )}
                </section>

                {/* 资源显示 */}
                <section className="resources-section">
                    <h2>资源</h2>
                    <div className="resources-grid">
                        {resources.map(resource => resource.id !== "rereading" && (
                            <div key={resource.id} className="resource-card">
                                <h3>{resource.name}</h3>
                                <div className="resource-value">
                                    {formatNumber(resource.value)}
                                </div>
                                <div className="resource-per-second">
                                    +{formatNumber(resourceManager.getResourceValue(resource.id))}/s
                                </div>
                                {resource.id === 'paper' && (
                                    <div className="paper-multiplier">
                                        全局加成: {((paperSystem.getPaperMultiplier() - 1) * 100).toFixed(1)}%
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* 建筑显示 */}
                <section className="buildings-section">
                    <h2>建筑</h2>
                    <div className="buildings-grid">
                        {buildings.map(building => (
                            <div key={building.id} className="building-card" data-building={building.id}>
                                <h3>{building.name}</h3>
                                <div className="building-count">数量: {building.count}</div>
                                <div className="building-production">
                                    产出: {formatNumber(buildingManager.getBuildingProduction(building.id))}/s
                                    {building.outputResource === 'knowledge' && (
                                        <div className="conversion-rate">
                                            转化率: {(building.conversionRate * (1 + building.count * 0.01) * 100).toFixed(3)}%
                                        </div>
                                    )}
                                    {/* 显示基于建筑数量的加成效率 */}
                                    {building.id === 'bookshelf' && buildingEfficiency.reading < 0.95 && (
                                        <div className="efficiency-warning">
                                            加成效率: {(buildingEfficiency.reading * 100).toFixed(1)}%
                                        </div>
                                    )}
                                    {building.id === 'notebook' && buildingEfficiency.knowledge < 0.95 && (
                                        <div className="efficiency-warning">
                                            加成效率: {(buildingEfficiency.knowledge * 100).toFixed(1)}%
                                        </div>
                                    )}
                                </div>
                                <div className="building-cost">
                                    价格: {formatNumber(buildingManager.getBuildingCost(building.id))} {
                                        building.id === 'penAndBook' || (building.outputResource == 'knowledge' && building.id !== 'notebook') ? '知识' : '读书量'
                                    }
                                </div>
                                <button
                                    className="buy-button"
                                    onClick={() => buyBuilding(building.id)}
                                    disabled={!buildingManager.canBuyBuilding(building.id,
                                        building.id === 'penAndBook' || (building.outputResource == 'knowledge' && building.id !== 'notebook') ? 'knowledge' : 'reading'
                                    )}
                                >
                                    购买
                                </button>
                                <button
                                    className="buy-button"
                                    onClick={() => buyBuildingAll(building.id)}
                                    disabled={!buildingManager.canBuyBuilding(building.id,
                                        building.id === 'penAndBook' || (building.outputResource == 'knowledge' && building.id !== 'notebook') ? 'knowledge' : 'reading'
                                    )}
                                >
                                    购买全部
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 普通升级显示 */}
                {upgrades.length > 0 && (
                    <section className="upgrades-section">
                        <h2>升级</h2>
                        <div className="upgrades-grid">
                            {upgrades.map(upgrade => (
                                <div key={upgrade.id} className="upgrade-card">
                                    <h3>{upgrade.name}</h3>
                                    <div className="upgrade-cost">成本: {formatNumber(upgrade.cost)} {upgrade.costResource === 'knowledge' ? '知识' : '读书量'}</div>
                                    <div className="upgrade-effect">
                                        效果: {upgrade.multiplierValue}x {upgrade.targetId}
                                    </div>
                                    <button
                                        className="buy-button"
                                        onClick={() => buyUpgrade(upgrade.id)}
                                        disabled={!upgradeManager.canBuyUpgrade(upgrade.id)}
                                    >
                                        购买升级
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 智慧升级 */}
                {prestigeManager.wisdom > 0 && (
                    <section className="wisdom-section">
                        <h2>智慧升级</h2>
                        <div className="wisdom-grid">
                            {wisdomUpgrades.map(upgrade => (
                                <div key={upgrade.id} className="wisdom-card">
                                    <h3>{upgrade.name} {getState(upgrade)}</h3>
                                    <div className="upgrade-effect">
                                        {upgrade.effect === 'costReduction' ? (
                                            <>建筑成本降低: {(0.02 * upgrade.level * 100).toFixed(1)}%</>
                                        ) : upgrade.effect === 'paperProbability' ? (
                                            <>论文概率: {(paperSystem.baseProbability * 100).toFixed(2)}%</>
                                        ) : (
                                            <>全局乘数: {Math.pow(upgrade.multiplier, upgrade.level).toFixed(2)}x</>
                                        )}
                                    </div>
                                    <div className="upgrade-cost">
                                        成本: {formatNumber(prestigeManager.getWisdomUpgradeCost(upgrade.id))} 智慧
                                    </div>
                                    <button
                                        className="buy-button"
                                        onClick={() => buyWisdomUpgrade(upgrade.id)}
                                        disabled={!prestigeManager.canBuyWisdomUpgrade(upgrade.id)}
                                    >
                                        升级
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <DebugConsole
                isVisible={showDebugConsole}
                onClose={() => setShowDebugConsole(false)}
                resourceManager={resourceManager}
                buildingManager={buildingManager}
                upgradeManager={upgradeManager}
                prestigeManager={prestigeManager}
            />
        </div>
    );
};

export default Game;