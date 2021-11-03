// common setup
const cyInterfaceCommon = {
    button: {
        menu: "[data-cy=\"portal_work_menu_sidebar\"]",
        user: "[data-cy=\"user_icon\"]",
    },
    option: {
        user: {
            logout: "[data-cy=\"user_logout\"]",
        }
    }
}
const module = ["cars"];

const importModule = (moduleName) => {
    cy.request("POST", "/test/import", {
        file: `imports/test_${moduleName.toLowerCase()}/test_import/module.json`,
    });

    //fix file import
    const commands = ["reset", "import-files"];
    cy.exec(`bash ${path.join("cypress", "integration" ,`test_${moduleName.toLowerCase()}`, "test_setup", "commands", "file_manager.sh")} ${commands.join(' ')}`);
}

const sqlManager = (moduleName, sqlFile) => {
    cy.exec(`ls ${path.join("cypress", "integration", `test_${moduleName.toLowerCase()}`, "test_setup", "sql")}`).then(files => {
        const sqlFiles = files.stdout.split('\n').filter(e => e.includes(".sql"));
        cy.exec(`bash ${path.join("cypress", "integration", `test_${moduleName.toLowerCase()}`, "test_setup", "commands", "sql_manager.sh")} ${sqlFiles[sqlFiles.indexOf(sqlFile)]}`);
    });
}

// =====================================================================================================================

import * as Common from "../../../../setup/common.js";

import cyInterfaceCARS from "./test_setup/cy_interface/interface.json";
import example from "./test_example/example.json";
import path from "path";

// CARS setup
const moduleCARS = module[module.indexOf("cars")];

const navigator = () => {
    cy.get(cyInterfaceCommon.button.menu).click();
    cy.get(cyInterfaceCARS.navigator).click();
}

const childVisit = (indexOfChild) => {
    cy.get(cyInterfaceCommon.button.menu, { timeout: 5000 }).click();
    cy.get(cyInterfaceCARS.navigator).click();
    cy.get(cyInterfaceCARS.tab.socialWorker).click();
    cy.get(cyInterfaceCARS.page.socialWorker.tab.children).click();
    cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.children.container)
        .find(cyInterfaceCARS.page.socialWorker.page.children.view.children.index.replace("[index]", (5 + indexOfChild).toString()))
        .invoke("attr", "class")
        .then((data) => {
            cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.position.replace("[childID]", data.split(' ')[3].replace("ab-record-", ''))).click();
        });
};

const homeAdministrationVisit = (indexOfHome) => {
    cy.get(cyInterfaceCommon.button.menu, { timeout: 5000 }).click();
    cy.get(cyInterfaceCARS.navigator).click();
    cy.get(cyInterfaceCARS.tab.administration).click();
    cy.get(cyInterfaceCARS.page.administration.tab.home).click();
    cy.get(cyInterfaceCARS.page.administration.page.home.view.homes.container)
        .find(cyInterfaceCARS.page.administration.page.home.view.homes.index.replace("[index]", (9 + indexOfHome).toString()))
        .invoke("attr", "class")
        .then((data) => {
            cy.get(cyInterfaceCARS.page.administration.page.home.view.home.button.replace("[homeID]", data.split(' ')[3].replace("ab-record-", ''))).click({ force: true });
        });
};

// End to End Testing
describe("Test Child:", () => {
    before(() =>{
        Common.ResetDB(cy);
        cy.wait(1500);
        Common.AuthLogin(cy);
        importModule(moduleCARS);
        cy.wait(1500);
    });

    beforeEach(() => {
        Common.AuthLogin(cy);
        sqlManager(moduleCARS,"reset-db");
        cy.wait(1500);
    });

    it("Test Adding New Child", () => {

        //arrange
        const childrenIndex = 0;
        const child = example.children[childrenIndex];

        //act
        sqlManager(moduleCARS, "init_db_for_adding_new_child.sql");
        cy.visit("/").wait(2500);
        navigator();
        cy.get(cyInterfaceCARS.tab.socialWorker).click();
        cy.get(cyInterfaceCARS.page.socialWorker.tab.children).click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.button.addChildren).click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.no).type(child.no);
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.firstName).type(child.firstName);
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.lastName).type(child.lastName);
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.nickname).type(child.nickname);
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.birthday).type(child.birthday);
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.birthday).click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.gender).click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.option.gender[0]).click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.religion).click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.option.religion[3]).click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.race).type(child.race);
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.nationality).type(child.nationality);
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.home).click();
        cy.get('.selectivity-result-item').click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.typeReceived).click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.option.typeReceived[0]).click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.timeReceivedfor).type(child.timeReceivedfor);
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.relatives).click();
        cy.get('.selectivity-result-item').click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.carsProject).click();
        cy.get('.selectivity-result-item').click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.button.save).click()

        // prepare for assertion
        // cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.firstName, { timeout: 30000 });
        // cy.get('.ab-menu-left .webix_list_item').click();

        // TODO: shouldn't need to wait and reload.
        cy.wait(2500);
        cy.visit("/").wait(2500);

        //assert
        //assert in the Chindren container
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.children.container).should((data) =>{
            expect(data.text().includes(`Registration number (TH): ${child.no}`) ? child.no: "", "Registration number").to.eq(child.no);
            expect(data.text().includes(`${child.firstName}`) ? child.firstName: "", "First Name").to.eq(child.firstName);
            expect(data.text().includes(`${child.lastName}`) ? child.lastName: "", "Last Name").to.eq(child.lastName);
            expect(data.text().includes(`(${child.nickname})`) ? child.nickname: "", "Nickname").to.eq(child.nickname);
            expect(data.text().includes(`${child.home}`) ? child.home: "", "Home").to.eq(child.home);
            expect(data.text().includes(`${child.birthday}`) ? child.birthday: "", "Birthday").to.eq(child.birthday);
        });
    });

    it("Test Viewing A Child's Profile", () => {

        //arrange
        const childrenIndex = 0;
        const child = example.children[childrenIndex];

        // act
        sqlManager(moduleCARS, "init_db_for_viewing_a_child_profile.sql");

        // prepare for assertion
        cy.visit("/").wait(2500);
        childVisit(childrenIndex);
        // cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.tab.basicInfo).click();
        // cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.tab.basicInfo).click();

        // TODO: shouldn't need to wait.
        cy.wait(2500);
        
        // assert
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.timeReceivedfor).should((data) => {
            expect(data.text().includes(child.timeReceivedfor) ? child.timeReceivedfor: "", "Time Recieved for").to.eq(child.timeReceivedfor);
        });
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.firstName).should((data) => {
            expect(data.text().includes(child.firstName) ? child.firstName: "", "First Name").to.eq(child.firstName);
        });
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.lastName).should((data) => {
            expect(data.text().includes(child.lastName) ? child.lastName: "", "Last Name").to.eq(child.lastName);
        });
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.nickname).should((data) => {
            expect(data.text().includes(child.nickname) ? child.nickname: "", "Nickname").to.eq(child.nickname);
        });
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.race).should((data) => {
            expect(data.text().includes(child.race) ? child.race: "", "Race").to.eq(child.race);
        });
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.nationality).should((data) => {
            expect(data.text().includes(child.nationality) ? child.nationality: "", "Nationality").to.eq(child.nationality);
        });
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.birthday).should((data) => {
            expect(data.text().includes(child.birthday) ? child.birthday: "", "Birthday").to.eq(child.birthday);
        });
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.religion).should((data) => {
            expect(data.text().includes(child.religion) ? child.religion: "", "Religion").to.eq(child.religion);
        });
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.home).should((data) => {
            expect(data.text().includes(child.home) ? child.home: "", "Home").to.eq(child.home);
        });
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.gender).should((data) => {
            expect(data.text().includes(child.gender) ? child.gender: "", "Gender").to.eq(child.gender);
        });
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.typeReceived).should((data) => {
            expect(data.text().includes(child.typeReceived) ? child.typeReceived: "", "Type Recieived").to.eq(child.typeReceived);
        });
    });

    it("Test editing a child", () => {

        //arrange
        const childrenIndex = 0;
        const child = example.children[childrenIndex];

        //act
        sqlManager(moduleCARS, "init_db_for_editing_a_child.sql");
        cy.visit("/").wait(2500);
        navigator();
        childVisit(childrenIndex);
        // cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.tab.basicInfo).click();
        // cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.tab.basicInfo).click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.button.editBasicInfo).click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.form.editBasicInfo.field.idIssueDate).type(child.idIssueDate);
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.form.editBasicInfo.field.idExpireDate).type(child.idExpireDate);
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.form.editBasicInfo.field.idNumber).type(child.idNumber);
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.form.editBasicInfo.field.address).click();
        cy.get('.selectivity-result-item').click();  
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.form.editBasicInfo.button.save).click();
        
        // prepare for assertion
        // TODO: shouldn't need to reload.
        cy.visit("/").wait(2500);
        childVisit(childrenIndex);

        // TODO: shouldn't need to wait.
        cy.wait(2500);

        //assert
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.idExpireDate).should((data) => {
            expect(data.text().includes(child.idExpireDate) ? child.idExpireDate: "", "ID Expire Date").to.eq(child.idExpireDate);
        });
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.idNumber).should((data) => {
            expect(data.text().includes(child.idNumber) ? child.idNumber: "", "ID Number").to.eq(child.idNumber);
        });
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.address).should((data) => {
            expect(data.text().includes(child.address.addressNo) ? child.address.addressNo: "", "Address No").to.eq(child.address.addressNo);
            expect(data.text().includes(` ${child.address.moo} `) ? child.address.moo: "", "Moo").to.eq(child.address.moo);
            expect(data.text().includes(child.address.district) ? child.address.district: "", "District").to.eq(child.address.district);
            expect(data.text().includes(child.address.city) ? child.address.city: "", "City").to.eq(child.address.city);
            expect(data.text().includes(child.address.province) ? child.address.province: "", "Province").to.eq(child.address.province);
            expect(data.text().includes(child.address.postalCode) ? child.address.postalCode: "", "Postal Code").to.eq(child.address.postalCode);
        });
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.idIssueDate).should((data) => {
            expect(data.text().includes(child.idIssueDate) ? child.idIssueDate: "", "ID Issue Date").to.eq(child.idIssueDate);
        });
    });
});

describe("Test Report:", () => {
    before(() => {
        Common.ResetDB(cy);
        cy.wait(1500);
        Common.AuthLogin(cy);
        importModule(moduleCARS);
        cy.wait(1500);
    });

    beforeEach(() => {
        Common.AuthLogin(cy);
        sqlManager(moduleCARS, "reset-db");
        cy.wait(1500);
    });

    it("Export basic report", () => {

        //arrange
        const childrenIndex = 0;
        const child = example.children[childrenIndex];

        //act
        sqlManager(moduleCARS, "init_db_default.sql");
        cy.visit("/").wait(2500);
        navigator();
        childVisit(childrenIndex);
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.button.reports).click();

        // TODO: Shouldn't wait
        cy.wait(1000);

        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.page.reports.button.dowloads.one).click();

        // prepare for assertion
        // TODO: Shouldn't wait
        cy.wait(1000);
        
        // assert
        //${path.join("cypress", "downloads")}
        cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.page.reports.button.dowloads.one).then(data => {
            cy.exec(`ls ${path.join("cypress", "downloads")}`).should(files => {
                const downloadFiles = files.stdout.split('\n').map((e, i) => e.match(/(.+)\..+$/)[1]);
                expect(downloadFiles, "File Downloads").to.contain(data.text());
            });
        });
    });
});

describe("Test Home:", () => {
    before(() =>{
        Common.ResetDB(cy);
        cy.wait(1500);
        Common.AuthLogin(cy);
        importModule(moduleCARS);
        cy.wait(1500);
    });

    beforeEach(() => {
        Common.AuthLogin(cy);
        sqlManager(moduleCARS, "reset-db");
        cy.wait(1500);
    });

    it("Test Add New Home", () => {
        
        // arrange
        const homesIndex = 0;
        const home = example.homes[homesIndex];

        // act
        sqlManager(moduleCARS, "init_db_for_adding_new_home.sql");
        cy.visit("/").wait(2500);
        navigator();
        cy.get(cyInterfaceCARS.page.socialWorker.tab.home).click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.home.button.addChildrenHome).click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.home.form.addChildrenHome.field.homeName).type(home.homeName);
        cy.get(cyInterfaceCARS.page.socialWorker.page.home.form.addChildrenHome.field.director).type(home.director);
        cy.get(cyInterfaceCARS.page.socialWorker.page.home.form.addChildrenHome.field.socialWorker).type(home.socialWorker);
        cy.get(cyInterfaceCARS.page.socialWorker.page.home.form.addChildrenHome.field.staff).click();
        cy.get(".selectivity-result-item").click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.home.form.addChildrenHome.field.address).click();
        cy.get(".selectivity-result-item").click();
        cy.get(cyInterfaceCARS.page.socialWorker.page.home.form.addChildrenHome.field.carsProject).click();
        cy.get(".selectivity-result-item").click();
        cy.get(".webix_layout_form")
            .find("div[view_id=\"$layout560\"]")
            .find(cyInterfaceCARS.page.socialWorker.page.home.form.addChildrenHome.button.save)
            .click();

        // assert
        // assert in the Home container
        cy.get(cyInterfaceCARS.page.socialWorker.page.home.view.homes.container)
            .should((data) => {
                expect(data.text().includes(home.homeName) ? home.homeName: "", "Home Name").to.eq(home.homeName);
                expect(data.text().includes(home.director) ? home.director: "", "Director").to.eq(home.director);
                expect(data.text().includes(home.socialWorker) ? home.socialWorker: "", "Social Worker").to.eq(home.socialWorker);
                expect(data.text().includes(home.address.addressNo) ? home.address.addressNo: "", "Address No").to.eq(home.address.addressNo);
                expect(data.text().includes(` ${home.address.addressNo} `) ? home.address.moo: "", "Moo").to.eq(home.address.moo);
                expect(data.text().includes(home.address.district) ? home.address.district: "", "District").to.eq(home.address.district);
                expect(data.text().includes(home.address.city) ? home.address.city: "", "City").to.eq(home.address.city);
                expect(data.text().includes(home.address.province) ? home.address.province: "", "Province").to.eq(home.address.province);
                expect(data.text().includes(home.address.postalCode) ? home.address.postalCode: "", "Postal Code").to.eq(home.address.postalCode);
                expect(data.text().includes(home.staff) ? home.staff: "", "Staff").to.eq(home.staff);
            })
            .find(".webix_vscroll_x")
            .scrollTo("right")
            .get(cyInterfaceCARS.page.socialWorker.page.home.view.homes.container)
            .should((data) =>{
                    expect(data.text().includes(home.carsProject.name) ? home.carsProject.name: "", "CARS Project").to.eq(home.carsProject.name);
                });
    });

    it("Test Update existing Home", () => {

        // arrange
        const homesIndex = 0;
        const home = example.homes[homesIndex];

        // act
        sqlManager(moduleCARS, "init_db_for_updating_existing_home.sql");
        cy.visit("/").wait(2500);
        navigator();
        cy.get(cyInterfaceCARS.tab.administration).click();
        cy.get(cyInterfaceCARS.page.administration.tab.home).click();
        homeAdministrationVisit(homesIndex);
        cy.get(cyInterfaceCARS.page.administration.page.home.view.home.form.field.phoneNumber).type(home.phoneNumber);
        cy.get(cyInterfaceCARS.page.administration.page.home.view.home.form.button.save).click();

        // prepare for assertion
        cy.get(cyInterfaceCARS.tab.socialWorker).click();
        cy.get(cyInterfaceCARS.page.socialWorker.tab.home).click();

        // assert
        cy.get(cyInterfaceCARS.page.socialWorker.page.home.view.homes.container)
            .find(".webix_vscroll_x")
            .scrollTo("right")
            .get(cyInterfaceCARS.page.socialWorker.page.home.view.homes.container)
            .should(data => {
                expect(data.text().includes(home.phoneNumber) ? home.phoneNumber: "", "Phone Number").to.eq(home.phoneNumber);
            });
    });
});