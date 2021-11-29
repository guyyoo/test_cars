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
  cy.request({
    method: "POST",
    url: "/test/import",
    timeout: 300000,
    body: {
        file: `imports/test_${moduleName.toLowerCase()}/test_import/module.json`
    }
  });

    //fix file import
    const commands = ["reset", "import-files"];
    cy.exec(`bash ${path.join("cypress", "integration" ,`test_${moduleName.toLowerCase()}`, "test_setup", "commands", "file_manager.sh")} ${commands.join(' ')}`);
}

const sqlManager = (moduleName, sqlFile) => {
  cy.exec(`bash -c "ls ${path.join("cypress", "integration", `test_${moduleName.toLowerCase()}`, "test_setup", "sql")}"`).then((files) => {
    const sqlFiles = files.stdout.split(/[\s\n\\]+/).filter(e => e.includes(".sql"));
    cy.exec(`bash ${path.join("cypress", "integration", `test_${moduleName.toLowerCase()}`, "test_setup", "commands", "sql_manager.sh")} ${sqlFiles[sqlFiles.indexOf(sqlFile)]}`);
  });
}

// =====================================================================================================================

import * as Common from "../../../../setup/common.js";

import cyInterfaceCARS from "./test_setup/cy_interface/interface.json";
import cyInterfaceADMIN from "./test_setup/cy_interface/admin_interface.json";
import example from "./test_example/example.json";
import path from "path";
import { hasUncaughtExceptionCaptureCallback } from "process";


// CARS setup
const moduleCARS = module[module.indexOf("cars")];

const navigator = () => {
    cy.get(cyInterfaceCommon.button.menu).click();
    cy.get(cyInterfaceCARS.navigator).click();
}


const childVisit = (indexOfChild) =>{
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

// TODO check this
const projectAdministrationVisit = (indexOfProject) =>{
    cy.get(cyInterfaceCommon.button.menu, { timeout: 5000 }).click();
    cy.get(cyInterfaceCARS.navigator).click();
    cy.get(cyInterfaceCARS.tab.administration).click();
    cy.get(cyInterfaceCARS.page.administration.tab.project).click(); // or gratipay?
    cy.get(cyInterfaceCARS.page.administration.page.project.view.project.container)
        .find(cyInterfaceCARS.page.administration.page.project.view.project.index.replace("[index]", (9 + indexOfProject).toString()))
        .invoke("attr", "class")
        .then((data) => {
            cy.get(cyInterfaceCARS.page.administration.page.project.view.project.button.replace("[projectID]", data.split(' ')[3].replace("ab-record-", ''))).click({ force: true });
        });
};

// End to End Testing
// describe("Test Child:", () => {
//     before(() =>{
//         Common.ResetDB(cy);
//         cy.wait(1500);
//         Common.AuthLogin(cy);
//         importModule(moduleCARS);
//         cy.wait(1500);
//     });

//     beforeEach(() => {
//         Common.AuthLogin(cy);
//         sqlManager(moduleCARS,"reset_db.sql");
//         cy.wait(1500);
//     });

//     it("Test Adding New Child", () => {

//         //arrange
//         const childrenIndex = 0;
//         const child = example.children[childrenIndex];
//         const photoPath = path.join("..", "integration", `test_cars`, "test_example", "images", child.profilePhoto);
//         const fileExtension = child.profilePhoto.match(/(.+)\.(.+)$/)[2];

//         //act
//         sqlManager(moduleCARS, "init_db_for_adding_new_child.sql");
//         cy.visit("/").wait(2500);
//         navigator();
//         cy.get(cyInterfaceCARS.tab.socialWorker).click();
//         cy.get(cyInterfaceCARS.page.socialWorker.tab.children).click();
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.button.addChildren).click();
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.no).type(child.no);
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.firstName).type(child.firstName);
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.lastName).type(child.lastName);
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.nickname).type(child.nickname);

//         let uploadData;
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.profilePhoto)
//             .invoke("attr", "data-uploader-id")
//             .then(uploader => {
//                 cy.fixture(photoPath).then(data => {
//                     const blob = Cypress.Blob.base64StringToBlob(data,  `image/${fileExtension}`);
//                     const file = new File([blob], photoPath, {
//                         type: `image/${fileExtension}`
//                     });
//                     cy.window().then((win) => {
//                         return win.$$(uploader).addFile(file, file.size, fileExtension)
//                     })
//                     .then((result) => {
//                         uploadData = result;
//                     });
//                 });
//             });

//         cy.wait(500);

//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.birthday).type(child.birthday);
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.birthday).click();
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.gender).click();
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.option.gender[0]).click();
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.religion).click();
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.option.religion[3]).click();
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.race).type(child.race);
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.nationality).type(child.nationality);
//         // cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.home).click();
//         // cy.get('.selectivity-result-item').click();
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.typeReceived).click();
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.option.typeReceived[0]).click();
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.timeReceivedfor).type(child.timeReceivedfor);
//         // cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.relatives).click();
//         // cy.get('.selectivity-result-item').click();
//         // cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.field.carsProject).click();
//         // cy.get('.selectivity-result-item').click();
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.form.addChildren.button.save).click()

//         // prepare for assertion
//         // cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.firstName, { timeout: 30000 });
//         // cy.get('.ab-menu-left .webix_list_item').click();

//         // // TODO: shouldn't need to wait and reload.
//         cy.wait(2500);

//         //assert
//         //assert in the Children container
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.children.container)
//             .then((data) =>{
//                 // expect(data.text().includes(`Registration number (TH): ${child.no}`) ? child.no: "", "Registration number").to.eq(child.no);
//                 // expect(data.text().includes(`${child.firstName}`) ? child.firstName: "", "First Name").to.eq(child.firstName);
//                 // expect(data.text().includes(`${child.lastName}`) ? child.lastName: "", "Last Name").to.eq(child.lastName);
//                 // expect(data.text().includes(`(${child.nickname})`) ? child.nickname: "", "Nickname").to.eq(child.nickname);
//                 // expect(data.text().includes(`${child.home}`) ? child.home: "", "Home").to.eq(child.home);
//                 // expect(data.text().includes(`${child.birthday}`) ? child.birthday: "", "Birthday").to.eq(child.birthday);
//                 // expect(uploadData.name.includes(`${child.profilePhoto}`) ? child.profilePhoto: "", "Filename").to.eq(child.profilePhoto);
//                 expect(1).to.eq(1);
//             })

//             // assert the image by uuid
//             // .find('img')
//             // .invoke('attr', 'src')
//             // .then((data) => {
//             //     expect(data.includes(`${uploadData.data.uuid}`) ? uploadData.data.uuid: "", "FileUUID").to.eq(uploadData.data.uuid);
//             // });
//     });

//     // it("Test Viewing A Child's Profile", () => {

//     //     //arrange
//     //     const childrenIndex = 0;
//     //     const child = example.children[childrenIndex];

//     //     // act
//     //     sqlManager(moduleCARS, "init_db_for_viewing_a_child_profile.sql");

//     //     // prepare for assertion
//     //     cy.visit("/").wait(2500);
//     //     childVisit(childrenIndex);
//     //     // cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.tab.basicInfo).click();
//     //     // cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.tab.basicInfo).click();

//     //     // TODO: shouldn't need to wait.
//     //     cy.wait(2500);

//     //     // assert
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.timeReceivedfor).should((data) => {
//     //         expect(data.text().includes(child.timeReceivedfor) ? child.timeReceivedfor: "", "Time Recieved for").to.eq(child.timeReceivedfor);
//     //     });
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.firstName).should((data) => {
//     //         expect(data.text().includes(child.firstName) ? child.firstName: "", "First Name").to.eq(child.firstName);
//     //     });
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.lastName).should((data) => {
//     //         expect(data.text().includes(child.lastName) ? child.lastName: "", "Last Name").to.eq(child.lastName);
//     //     });
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.nickname).should((data) => {
//     //         expect(data.text().includes(child.nickname) ? child.nickname: "", "Nickname").to.eq(child.nickname);
//     //     });
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.race).should((data) => {
//     //         expect(data.text().includes(child.race) ? child.race: "", "Race").to.eq(child.race);
//     //     });
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.nationality).should((data) => {
//     //         expect(data.text().includes(child.nationality) ? child.nationality: "", "Nationality").to.eq(child.nationality);
//     //     });
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.birthday).should((data) => {
//     //         expect(data.text().includes(child.birthday) ? child.birthday: "", "Birthday").to.eq(child.birthday);
//     //     });
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.religion).should((data) => {
//     //         expect(data.text().includes(child.religion) ? child.religion: "", "Religion").to.eq(child.religion);
//     //     });
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.home).should((data) => {
//     //         expect(data.text().includes(child.home) ? child.home: "", "Home").to.eq(child.home);
//     //     });
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.gender).should((data) => {
//     //         expect(data.text().includes(child.gender) ? child.gender: "", "Gender").to.eq(child.gender);
//     //     });
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.typeReceived).should((data) => {
//     //         expect(data.text().includes(child.typeReceived) ? child.typeReceived: "", "Type Recieived").to.eq(child.typeReceived);
//     //     });
//     // });

//     // it("Test editing a child", () => {

//     //     //arrange
//     //     const childrenIndex = 0;
//     //     const child = example.children[childrenIndex];

//     //     //act
//     //     sqlManager(moduleCARS, "init_db_for_editing_a_child.sql");
//     //     cy.visit("/").wait(2500);
//     //     navigator();
//     //     childVisit(childrenIndex);
//     //     // cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.tab.basicInfo).click();
//     //     // cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.tab.basicInfo).click();
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.button.editBasicInfo).click();
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.form.editBasicInfo.field.idIssueDate).type(child.idIssueDate);
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.form.editBasicInfo.field.idExpireDate).type(child.idExpireDate);
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.form.editBasicInfo.field.idNumber).type(child.idNumber);
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.form.editBasicInfo.field.address).click();
//     //     cy.get('.selectivity-result-item').click();
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.form.editBasicInfo.button.save).click();

//     //     // prepare for assertion
//     //     // TODO: shouldn't need to reload.
//     //     cy.visit("/").wait(2500);
//     //     childVisit(childrenIndex);

//     //     // TODO: shouldn't need to wait.
//     //     cy.wait(2500);

//     //     //assert
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.idExpireDate).should((data) => {
//     //         expect(data.text().includes(child.idExpireDate) ? child.idExpireDate: "", "ID Expire Date").to.eq(child.idExpireDate);
//     //     });
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.idNumber).should((data) => {
//     //         expect(data.text().includes(child.idNumber) ? child.idNumber: "", "ID Number").to.eq(child.idNumber);
//     //     });
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.address).should((data) => {
//     //         expect(data.text().includes(child.address.addressNo) ? child.address.addressNo: "", "Address No").to.eq(child.address.addressNo);
//     //         expect(data.text().includes(` ${child.address.moo} `) ? child.address.moo: "", "Moo").to.eq(child.address.moo);
//     //         expect(data.text().includes(child.address.district) ? child.address.district: "", "District").to.eq(child.address.district);
//     //         expect(data.text().includes(child.address.city) ? child.address.city: "", "City").to.eq(child.address.city);
//     //         expect(data.text().includes(child.address.province) ? child.address.province: "", "Province").to.eq(child.address.province);
//     //         expect(data.text().includes(child.address.postalCode) ? child.address.postalCode: "", "Postal Code").to.eq(child.address.postalCode);
//     //     });
//     //     cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.idIssueDate).should((data) => {
//     //         expect(data.text().includes(child.idIssueDate) ? child.idIssueDate: "", "ID Issue Date").to.eq(child.idIssueDate);
//     //     });
//     // });
// });

// describe("Test Report:", () => {
//     before(() => {
//         Common.ResetDB(cy);
//         cy.wait(1500);
//         Common.AuthLogin(cy);
//         importModule(moduleCARS);
//         cy.wait(1500);
//     });

//     beforeEach(() => {
//         Common.AuthLogin(cy);
//         sqlManager(moduleCARS, "reset_db.sql");
//         cy.wait(1500);
//     });

//     it("Export basic report", () => {

//         //arrange
//         const childrenIndex = 0;
//         const child = example.children[childrenIndex];

//         //act
//         sqlManager(moduleCARS, "init_db_default.sql");
//         cy.visit("/").wait(2500);
//         navigator();
//         childVisit(childrenIndex);
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.button.reports).click();

//         // TODO: Shouldn't wait
//         cy.wait(1000);

//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.page.reports.button.dowloads.one).click();

//         // prepare for assertion
//         // TODO: Shouldn't wait
//         cy.wait(1000);

//         // assert
//         //${path.join("cypress", "downloads")}
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.page.reports.button.dowloads.one).then(data => {
//             cy.exec(`ls ${path.join("cypress", "downloads")}`).should(files => {
//                 const downloadFiles = files.stdout.split('\n').map((e, i) => e.match(/(.+)\..+$/)[1]);
//                 expect(downloadFiles, "File Downloads").to.contain(data.text());
//             });
//         });
//     });
// });

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
        sqlManager(moduleCARS, "reset_db.sql");
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

        cy.get(cyInterfaceCARS.page.socialWorker.tab.children).click().wait(500);
        cy.get(cyInterfaceCARS.page.socialWorker.tab.home).click();
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
            // .scrollTo("right")
            .get(cyInterfaceCARS.page.socialWorker.page.home.view.homes.container)
                .should((data) =>{
                    expect(data.text().includes(home.carsProject.name) ? home.carsProject.name: "", "CARS Project").to.eq(home.carsProject.name);
                });
    });

    // it("Test Update existing Home", () => {

    //     // arrange
    //     const homesIndex = 0;
    //     const home = example.homes[homesIndex];

    //     // act
    //     sqlManager(moduleCARS, "init_db_for_updating_existing_home.sql");
    //     cy.visit("/").wait(2500);
    //     navigator();
    //     cy.get(cyInterfaceCARS.tab.administration).click();
    //     cy.get(cyInterfaceCARS.page.administration.tab.home).click();
    //     homeAdministrationVisit(homesIndex);
    //     cy.get(cyInterfaceCARS.page.administration.page.home.view.home.form.field.phoneNumber).type(home.phoneNumber);
    //     cy.get(cyInterfaceCARS.page.administration.page.home.view.home.form.button.save).click();

    //     // prepare for assertion
    //     cy.get(cyInterfaceCARS.tab.socialWorker).click();
    //     cy.get(cyInterfaceCARS.page.socialWorker.tab.home).click();

    //     // assert
    //     cy.get(cyInterfaceCARS.page.socialWorker.page.home.view.homes.container)
    //         .find(".webix_vscroll_x")
    //         .scrollTo("right")
    //         .get(cyInterfaceCARS.page.socialWorker.page.home.view.homes.container)
    //         .should(data => {
    //             expect(data.text().includes(home.phoneNumber) ? home.phoneNumber: "", "Phone Number").to.eq(home.phoneNumber);
    //         });
    // });
});

// describe("Test Project:", () => {
//     before(() =>{
//         Common.ResetDB(cy);
//         cy.wait(1500);
//         Common.AuthLogin(cy);
//         importModule(moduleCARS);
//         cy.wait(1500);
//     });

//     beforeEach(() => {
//         Common.AuthLogin(cy);
//         sqlManager(moduleCARS,"reset_db.sql");
//         cy.wait(1500);
//     });

//     it("Test Add New Project", () => {

//         // arrange
//         const homesIndex = 1;
//         const home = example.homes[homesIndex];
//         const project = example.projects[0];

//         // act
//         sqlManager(moduleCARS,"init_db_for_adding_new_project.sql");
//         cy.visit("/").wait(2500);
//         navigator();

//         cy.get(cyInterfaceCARS.tab.administration).click();
//         cy.get(cyInterfaceCARS.page.administration.tab.project).click().wait(100);
//         cy.get(cyInterfaceCARS.page.administration.page.project.button.addProject).click().wait(300);
//         cy.get(cyInterfaceCARS.page.administration.page.project.form.addProject.field.name).type(example.projects[0].projectName);
//         cy.get(cyInterfaceCARS.page.administration.page.project.form.addProject.field.projectHome).click().wait(500);
//         cy.get(".selectivity-result-item").click();

//         cy.get(cyInterfaceCARS.page.administration.page.project.form.addProject.button.save).click();

//         cy.get(cyInterfaceCARS.page.administration.tab.home).click();
//         cy.get(cyInterfaceCARS.page.administration.tab.project).click().wait(800);

//         // assert
//         // assert in the Home container
//         cy.get(cyInterfaceCARS.page.administration.page.project.view.projects.detail.projectName)
//         .find(".ab-detail-component-holder") // ab-detail-component-holder
//           .should((data) =>{
//             //cy.log(data.0)
//             //cy.log(Object.keys(data))
//             expect(data.text().includes(project.projectName) ? project.projectName: "", "Project Name").to.eq(project.projectName);
//           })
//           .get(cyInterfaceCARS.page.administration.page.project.view.projects.detail.homeName).find(".selectivity-multiple-selected-item ").should((data) => {
//             expect(data.text().includes(project.carsHomes) ? project.carsHomes: "", "Home").to.eq(project.carsHomes);
//           });
//     });

//     it("Test Update existing Project", () => {

//         sqlManager(moduleCARS,"reset_db.sql");
//         cy.wait(1500);

//         // arrange
//         const projectIndex = 0;
//         const project = example.projects[projectIndex];

//         // act
//         sqlManager(moduleCARS,"init_db_for_updating_existing_project.sql");
//         cy.visit("/").wait(2500);
//         navigator();
//         cy.get(cyInterfaceCARS.tab.administration).click();
//         cy.get(cyInterfaceCARS.page.administration.tab.project).click().wait(100);
//         cy.get(cyInterfaceCARS.page.administration.page.project.view.projects.detail.projectName).invoke('mouseover').wait(500)
//         cy.get(cyInterfaceCARS.page.administration.page.project.button.editProject).click({force: true});
//         cy.get(cyInterfaceCARS.page.administration.page.project.form.editProject.field.name).type("337");
//         cy.get(cyInterfaceCARS.page.administration.page.project.form.editProject.field.projectHome).click().wait(500);
//         cy.get(".selectivity-result-item").click();
//         cy.get(cyInterfaceCARS.page.administration.page.project.form.editProject.field.projectStaff).click().wait(500);
//         cy.get(".selectivity-result-item").click();
//         cy.get(cyInterfaceCARS.page.administration.page.project.form.editProject.button.save).click().wait(500);

//         //prepare for assertion
//         cy.get(cyInterfaceCARS.page.administration.tab.home).click();
//         cy.get(cyInterfaceCARS.page.administration.tab.project).click().wait(500);

//         // assert
//         // assert in the Home container
//         cy.get(cyInterfaceCARS.page.administration.page.project.view.projects.container)
//         .should((data) =>{
//           // TODO the dataview isn't updating
//           expect(data.text().includes(project.projectName) ? project.projectName: "", "Project Name").to.eq(project.projectName+"337");
//         });
//         // cy.get(cyInterfaceCARS.page.administration.page.project.view.projects.container)
//         // .find(".selectivity-multiple-selected-item ").should((data) => { // selectivity-multiple-selected-item
//         //   //cy.log(data)
//         //   //expect(data).to.have.string(project.carsHomes)
//         //   expect(data.text().includes(project.carsHomes) ? project.carsHomes: "", "Home Name").to.eq(project.carsHomes);
//         //   //expect(expect(data).to.include(project.carsHomes) ? project.carsHomes: "", "Home Name").to.eq(project.carsHomes);
//         // })
//     });
// });

// describe("Test Staff:", () => {
//     before(() =>{
//         Common.ResetDB(cy);
//         cy.wait(1500);
//         Common.AuthLogin(cy);
//         importModule(moduleCARS);
//         cy.wait(1500);
//     });

//     beforeEach(() => {
//         Common.AuthLogin(cy);
//         sqlManager(moduleCARS,"reset_db.sql");
//         cy.wait(1500);
//     });

//     it("Test Add New Staff", () => {

//         // arrange
//         const homesIndex = 1;
//         const home = example.homes[homesIndex];
//         const staff = example.staff[1];

//         //

//         // act

//         // CREATE USER
//         // TODO move to admin tests area?
//         cy.visit("/").wait(2500);
//         cy.get(cyInterfaceCommon.button.menu).click();
//         sqlManager(moduleCARS,"init_db_for_adding_new_staff.sql");
//         cy.get(cyInterfaceADMIN.tab.users).click().wait(100);
//         cy.get(cyInterfaceADMIN.page.users.page.button.addUser).click().wait(100);
//         cy.get(cyInterfaceADMIN.page.users.page.form.addUser.field.username).type(staff.staffUser);
//         cy.get(cyInterfaceADMIN.page.users.page.form.addUser.field.password).type("Password");
//         cy.get(cyInterfaceADMIN.page.users.page.form.addUser.field.email).type("new@user.com");
//         cy.get(cyInterfaceADMIN.page.users.page.form.addUser.field.isactive).click();
//         // TODO this is two elements somehow?????
//         // cy.get(cyInterfaceADMIN.page.users.page.form.addUser.field.languagecode)
//         //   .find(".selectivity-single-result-container").click({ multiple: true, force: true }).wait(100);
//         // cy.get(".selectivity-result-item")
//         //   .find(".highlight").click();

//         cy.get(cyInterfaceADMIN.page.users.page.form.addUser.button.save).click().wait(500);

//         // Create in CARs
//         cy.visit("/").wait(2500);
//         navigator();

//         cy.get(cyInterfaceCARS.tab.administration).click();
//         cy.get(cyInterfaceCARS.page.administration.tab.staff).click().wait(100);
//         cy.get(cyInterfaceCARS.page.administration.page.staff.button.addStaff).click().wait(300);
//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.addStaff.field.position).type(staff.position);
//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.addStaff.field.firstName).type(staff.firstName);
//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.addStaff.field.lastName).type(staff.lastName);
//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.addStaff.field.phone).type(staff.phone);

//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.addStaff.field.home).click().wait(500);
//         cy.get(".selectivity-result-item").click();

//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.addStaff.field.staffUser).click().wait(500);
//         // // this should work:
//         // cy.get(cyInterfaceCARS.page.administration.page.staff.form.addStaff.option.staffUser[1]).click().wait(250);
//         // option 2
//         cy.get(`[data-cy=\"user options ${staff.staffUser} 5cfb8cb4-26db-4204-a4d0-7c822eda4291 0eab74c9-f13b-4343-ab71-5e50875f8403\"]`).click().wait(250);

//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.addStaff.button.save).click().wait(300);

//         cy.get(cyInterfaceCARS.page.administration.tab.home).click().wait(700);
//         cy.get(cyInterfaceCARS.page.administration.tab.staff).click().wait(2500);

//         // assert
//         // assert in the Home container
//         cy.get(cyInterfaceCARS.page.administration.page.staff.view.staff.detail.firstName)
//           .should((data) =>{
//             expect(data.text().includes(staff.firstName) ? staff.firstName: "", "First Name").to.eq(staff.firstName);
//           })
//           .get(cyInterfaceCARS.page.administration.page.staff.view.staff.detail.lastName)
//           .should((data) =>{
//             expect(data.text().includes(staff.lastName) ? staff.lastName: "", "Last Name").to.eq(staff.lastName);
//           })
//         cy.get(cyInterfaceCARS.page.administration.page.staff.view.staff.detail.position)
//           .should((data) =>{
//             expect(data.text().includes(staff.position) ? staff.position: "", "Worker").to.eq(staff.position);
//           });
//         cy.get(cyInterfaceCARS.page.administration.page.staff.view.staff.detail.user)
//           .should((data) =>{
//             expect(data.text().includes(staff.staffUser) ? staff.staffUser: "", "User").to.eq(staff.staffUser);
//             // a800412a-ff61-4dad-aba5-7163b80ffa25
//             //detail text Staff User 5cfb8cb4-26db-4204-a4d0-7c822eda4291 513d727e-e395-4f46-b9a0-31f3a687a336
//           });

//     });

//     it("Test Update existing Staff", () => {

//         sqlManager(moduleCARS,"reset_db.sql");
//         cy.wait(1500);

//         // arrange
//         const staffIndex = 1;
//         const staff = example.staff[staffIndex];

//         // act
//         sqlManager(moduleCARS,"init_db_for_updating_existing_staff.sql");
//         cy.visit("/").wait(2500);
//         navigator();

//         cy.get(cyInterfaceCARS.tab.administration).click();
//         cy.get(cyInterfaceCARS.page.administration.tab.staff).click().wait(550);
//         // this randomly fails
//         //cy.get(cyInterfaceCARS.page.administration.page.staff.view.staff.container).trigger('mouseover').wait(500);
//         cy.get(cyInterfaceCARS.page.administration.page.staff.button.editStaff).invoke('show').click({force:true}).wait(300);
//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.editStaff.field.position).clear();
//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.editStaff.field.position).type(staff.position);
//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.editStaff.field.firstName).clear();
//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.editStaff.field.firstName).type(staff.firstName);
//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.editStaff.field.lastName).clear();
//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.editStaff.field.lastName).type(staff.lastName);
//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.editStaff.field.phone).clear();
//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.editStaff.field.phone).type(staff.phone);

//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.editStaff.field.home).click().wait(500);
//         cy.get(".selectivity-result-item").click();

//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.editStaff.field.staffUser).click().wait(500);

//         //// TODO this selector isn't working???
//         //cy.get(cyInterfaceCARS.page.administration.page.staff.form.editStaff.option.staffUser[0]).click();

//         // //cy.get(cyInterfaceCARS.page.administration.page.staff.button.editStaff)
//         // cy.get(".webix_view webix_window webix_popup")
//         //   .find(".webix_list_item ")
//         //   .should((data) =>{
//         //     cy.log(data)
//         //     // expect(data.text().includes(staff.position) ? staff.position: "", "Worker").to.eq(staff.position);
//         //   })

//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.editStaff.option.staffUser[1])
//           .should((data) =>{
//             cy.log(data)
//             // expect(data.text().includes(staff.position) ? staff.position: "", "Worker").to.eq(staff.position);
//           })

//         //cy.get(cyInterfaceCARS.page.administration.page.staff.form.editStaff.option.staffUser).click();
//           //.find(".webix_list_item")

//         //cy.get(cyInterfaceCARS.page.administration.page.staff.form.editStaff.option.staffUser).click().wait(50);

//         cy.get(cyInterfaceCARS.page.administration.page.staff.form.editStaff.button.save).click().wait(300);

//         cy.get(cyInterfaceCARS.page.administration.tab.home).click().wait(700);
//         cy.get(cyInterfaceCARS.page.administration.tab.staff).click().wait(700);

//         // assert
//         // assert in the Home container
//         cy.get(cyInterfaceCARS.page.administration.page.staff.view.staff.detail.firstName)
//           .should((data) =>{
//             expect(data.text().includes(staff.firstName) ? staff.firstName: "", "First Name").to.eq(staff.firstName);
//           });
//         cy.get(cyInterfaceCARS.page.administration.page.staff.view.staff.detail.position)
//           .should((data) =>{
//             expect(data.text().includes(staff.position) ? staff.position: "", "Worker").to.eq(staff.position);
//           });
//         cy.get(cyInterfaceCARS.page.administration.page.staff.view.staff.detail.lastName)
//           .should((data) =>{
//             expect(data.text().includes(staff.lastName) ? staff.lastName: "", "Last Name").to.eq(staff.lastName);
//           })
//         cy.get(cyInterfaceCARS.page.administration.page.staff.view.staff.detail.user)
//           .should((data) =>{
//             expect(data.text().includes(staff.staffUser) ? staff.staffUser: "", "Username").to.eq(staff.staffUser);
//           });
//     });
// });

// describe("Test Social Worker Note:", () => {
//     before(() =>{
//         Common.ResetDB(cy);
//         cy.wait(1500);
//         Common.AuthLogin(cy);
//         importModule(moduleCARS);
//         cy.wait(1500);
//     });

//     beforeEach(() => {
//         Common.AuthLogin(cy);
//         sqlManager(moduleCARS,"reset_db.sql");
//         cy.wait(1500);
//     });

//     it("Test Edit Note", () => {

//         // arrange
//         const staff = example.staff[0];
//         const note = example.note[0];

//         //act
//         sqlManager(moduleCARS,"init_db_for_updating_existing_note.sql");
//         cy.visit("/").wait(2500);
//         navigator()
//         cy.wait(500);

//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.existingChildButton[0]).click({ force: true }).wait(500);
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.tab.socialWork).click().wait(250);
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.tab.notes).click().wait(1500);
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.grid)
//           .find(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.columns[0]).click( { multiple: true, force: true } ).wait(1000);

//           cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.grid)
//             .find(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.columns[0])
//             .find(".webix_cell").click( { multiple: true, force: true } ).wait(1000)

//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.editNote.field.title).clear().type(note.title);

//         // Date
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.editNote.field.date).click();
//         cy.get(".webix_cal_icon_clear").click()
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.editNote.field.date).type(note.date);
//         // cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.editNote.field.date).click();
//         // cy.get(".webix_cal_icon_today").click()

//         // TODO this has no data-cy
//         //cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.editNote.field.text).clear().type(note.text);

//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.editNote.field.file).click().wait(50);
//         cy.get('.selectivity-result-item').click();

//         // TODO multiple item bug again
//         // //cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.addCategory.label).type(note.category);
//         // cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.editNote.field.categories).click().wait(50);
//         // cy.get('.selectivity-result-item').click();

//         //save
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.editNote.button.save).click().wait(500);


//         // prepare for assertion
//         // click reload data button
//         // TODO replace with data-cy
//         //cy.find('.webix_view webix_control webix_el_button webix_primary webix_warn').click();

//         //assert
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.grid)
//           .find(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.columns[0])
//           .find(".webix_row_select")
//           .should((data) => {
//             cy.log(data)
//           });

//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.grid)
//           .find(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.columns[0])
//           .find(".webix_row_select")
//           .should((data) => {
//             expect(data.text().includes(note.title) ? note.title: "", "Title").to.eq(note.title);
//           })
//           .get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.grid)
//           .find(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.columns[1])
//           .find(".webix_row_select")
//           .should((data) => {
//             expect(data.text().includes(note.date) ? note.date: "", "Date").to.eq(note.date);
//           })
//           // .get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.grid)
//           // .find(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.columns[2])
//           // .find(".webix_row_select")
//           // .should((data) => {
//           //   expect(data.text().includes(note.text) ? note.text: "", "text").to.eq(note.text);
//           // })
//           // .get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.grid)
//           // .find(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.columns[3])
//           // .find(".webix_row_select")
//           // .should((data) => {
//           //   expect(data.text().includes(note.category) ? note.category: "", "category").to.eq(note.category);
//           // })
//           // 4 is the child
//           .find(".webix_ss_right")
//           .scrollTo("right")
//           .get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.grid)
//           .find(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.columns[5])
//           .find(".webix_row_select")
//           .should((data) => {
//             expect(data.text().includes(note.fileName) ? note.fileName: "", "fileName").to.eq(note.fileName);
//           });
//     });

//     it("Test Add New Note", () => {

//         // arrange
//         const staff = example.staff[0];
//         const note = example.note[0];
//         cy.log(note)
//         // TODO act
//         //sqlManager(moduleCARS,"init_db_for_adding_new_note.sql");
//         //cy.visit("/").wait(2500);
//         //navigator();

//         //act
//         //sqlManager(moduleCARS,"init_db_for_editing_a_child.sql");
//         sqlManager(moduleCARS,"init_db_for_adding_new_note.sql");
//         cy.visit("/").wait(2500);
//         navigator()
//         cy.wait(500);
//         //childVisit(childrenIndex);

//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.existingChildButton[0]).click({ force: true }).wait(500);
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.tab.socialWork).click().wait(250);
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.tab.notes).click().wait(250);
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.button.addNote).click().wait(1000).pause();
//         // It breaks here, form doesn't work

//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.addNote.field.title).type(note.title);
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.addNote.field.date).type(note.date);
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.addNote.field.text).type(note.text);
//         //id="tinymce"
//         //class="mce-content-body "
//         // cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.addNote.field.file).click();
//         // cy.get('.selectivity-result-item').click();
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.addNote.field.file)
//           .find('.fa fa-plus ab-connect-add-new-link').click();
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.addFile.label).type(note.fileName);

//         // cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.addNote.field.categories).click();
//         // cy.get('.selectivity-result-item').click();
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.addNote.field.categories)
//           .find('.fa fa-plus ab-connect-add-new-link').click();
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.addCategory.label).type(note.category);
//         //save
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.socialWork.page.notes.form.addNote.button.save).click();

//         // prepare for assertion
//         // click reload data button
//         // TODO replace with data-cy
//         cy.find('.webix_view webix_control webix_el_button webix_primary webix_warn').click();

//         // TODO: shouldn't need to wait.
//         cy.wait(500);

//         //assert
//         //tabindex="0"
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.idExpireDate).should((data) => {
//             expect(data.text().includes(child.idExpireDate) ? child.idExpireDate: "", "ID Expire Date").to.eq(child.idExpireDate);
//         });
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.idNumber).should((data) => {
//             expect(data.text().includes(child.idNumber) ? child.idNumber: "", "ID Number").to.eq(child.idNumber);
//         });
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.address).should((data) => {
//             expect(data.text().includes(child.address.addressNo) ? child.address.addressNo: "", "Address No").to.eq(child.address.addressNo);
//             expect(data.text().includes(` ${child.address.moo} `) ? child.address.moo: "", "Moo").to.eq(child.address.moo);
//             expect(data.text().includes(child.address.district) ? child.address.district: "", "District").to.eq(child.address.district);
//             expect(data.text().includes(child.address.city) ? child.address.city: "", "City").to.eq(child.address.city);
//             expect(data.text().includes(child.address.province) ? child.address.province: "", "Province").to.eq(child.address.province);
//             expect(data.text().includes(child.address.postalCode) ? child.address.postalCode: "", "Postal Code").to.eq(child.address.postalCode);
//         });
//         cy.get(cyInterfaceCARS.page.socialWorker.page.children.view.child.page.basicInfo.page.basicInfo.field.idIssueDate).should((data) => {
//             expect(data.text().includes(child.idIssueDate) ? child.idIssueDate: "", "ID Issue Date").to.eq(child.idIssueDate);
//         });
//     });

// });
