# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
import unittest, time, re

class Integration(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        self.base_url = "http://etherex.github.io"
        self.verificationErrors = []
        self.accept_next_alert = True
        self.driver.set_window_position(0, 0)
        self.driver.set_window_size(1280, 1024)

    def test_integration(self):
        driver = self.driver
        driver.get(self.base_url + "/etherex/#/trades")
        time.sleep(5)
        driver.save_screenshot('screenshot.png')

        try:
            error = driver.find_element_by_css_selector("div.alert.alert-danger > span").text
            if "Unable to load addresses" in error:
                self.fail(error)
            if "No market found" in error:
                self.fail(error)
            error = driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[2]/h4").text
            if error == "No trades found":
                self.fail(error)
        except: pass

        try:
            self.assertEqual("1,606,938.0443 Uether", driver.find_element_by_css_selector("div.navbar > div.row > div.col-md-6 > div > span:nth-child(2)").text)
            self.assertEqual("7.435 thousand", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div/div[2]/div/div/div/span").text)
            self.assertEqual("2.565 thousand", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div/div[2]/div/div/div/span[3]").text)
            self.assertEqual("N/A ETX/ETH", driver.find_element_by_xpath("//div[@id='wrap']/div/div[3]/div/div/span[2]").text)
            self.assertEqual("Trades", driver.find_element_by_css_selector("div.col-md-3.col-xs-6 > h3 > span").text)
            self.assertEqual("Asks", driver.find_element_by_css_selector("div.hidden-xs.hidden-sm > div > div.col-md-6 > div > h4").text)
            self.assertEqual("50.00000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr/td/div").text)
            self.assertEqual("150.00000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr[2]/td/div").text)
            self.assertEqual("0.32000000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr[10]/td[3]/div").text)
            self.assertEqual("Bids", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/h4").text)
            self.assertEqual("0.24000000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/div/table/tbody/tr/td[3]/div").text)
            self.assertEqual("10.5000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/div/table/tbody/tr[4]/td[4]/div/span").text)

            driver.find_element_by_xpath("(//button[@type='button'])[2]").click()
            driver.find_element_by_link_text("CAK").click()
            time.sleep(5)
            self.assertEqual("5,000.0000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr/td/div").text)
            self.assertEqual("CAK", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr/td[2]/div").text)
            self.assertEqual("0.025", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr/td[3]/div").text)
            self.assertEqual("125.0000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr/td[4]/div/span").text)
            self.assertEqual("0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr/td[5]/div").text)
            self.assertEqual("55,000.0000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr[6]/td/div").text)
            self.assertEqual("0.030", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr[6]/td[3]/div").text)
            self.assertEqual("1,650.0000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr[6]/td[4]/div/span").text)
            self.assertEqual("500.0000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/div/table/tbody/tr/td/div").text)
            self.assertEqual("0.024", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/div/table/tbody/tr/td[3]/div").text)
            self.assertEqual("12.0000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/div/table/tbody/tr/td[4]/div/span").text)
            self.assertEqual("0.021", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/div/table/tbody/tr[4]/td[3]/div").text)
            self.assertEqual("820 thousand", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div/div[2]/div/div/div/span").text)
            self.assertEqual("180 thousand", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div/div[2]/div/div/div/span[3]").text)
            self.assertEqual("30 billion", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div/div[2]/div/div/div/span[5]").text)

            driver.find_element_by_xpath("(//button[@type='button'])[2]").click()
            driver.find_element_by_link_text("FAB").click()
            time.sleep(5)
            self.assertEqual("0.0025", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr/td[3]/div").text)
            self.assertEqual("0.0026", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr[2]/td[3]/div").text)
            self.assertEqual("0.0024", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/div/table/tbody/tr/td[3]/div").text)

            driver.find_element_by_xpath("(//button[@type='button'])[2]").click()
            driver.find_element_by_link_text("ETX").click()
            time.sleep(5)
            driver.find_element_by_xpath("(//input[@type='number'])[7]").clear()
            driver.find_element_by_xpath("(//input[@type='number'])[7]").send_keys("500")
            driver.find_element_by_xpath("(//input[@type='number'])[8]").clear()
            driver.find_element_by_xpath("(//input[@type='number'])[8]").send_keys("0.255")
            driver.find_element_by_xpath("(//input[@type='number'])[8]").send_keys("0")
            driver.find_element_by_xpath("(//button[@type='submit'])[3]").click()
            time.sleep(3)
            driver.find_element_by_css_selector("div.modal-footer > button.btn.btn-primary").click()
            time.sleep(5)

            driver.find_element_by_xpath("(//button[@type='button'])[18]").click()
            time.sleep(3)
            driver.find_element_by_css_selector("div.modal-footer > button.btn.btn-primary").click()
            time.sleep(5)

            self.assertEqual("500.00000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr[4]/td/div").text)
            self.assertEqual("0.25500000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr[4]/td[3]/div").text)
            self.assertEqual("127.5000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr[4]/td[4]/div/span").text)
            self.find_element_by_css_selector("html body div#wrap div.container div div div.hidden-xs.hidden-sm div div.col-md-6 div div.table-responsive table.table.table-striped.table-condensed.table-hover tbody tr.trade-pending.disabled:nth-child(4)")

            driver.find_element_by_css_selector("div.col-md-6 > div.container-fluid > form.form-horizontal > div.form-group > div.input-group > input.form-control.medium").clear()
            driver.find_element_by_css_selector("div.col-md-6 > div.container-fluid > form.form-horizontal > div.form-group > div.input-group > input.form-control.medium").send_keys("200")
            driver.find_element_by_xpath("(//input[@type='number'])[5]").clear()
            driver.find_element_by_xpath("(//input[@type='number'])[5]").send_keys("0.245")
            driver.find_element_by_xpath("(//input[@type='number'])[5]").send_keys("0")
            driver.find_element_by_xpath("(//button[@type='submit'])[2]").click()
            time.sleep(3)
            driver.find_element_by_css_selector("div.modal-footer > button.btn.btn-primary").click()
            time.sleep(5)
            self.assertEqual("200.00000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/div/table/tbody/tr/td/div").text)
            self.assertEqual("0.24500000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/div/table/tbody/tr/td[3]/div").text)
            self.assertEqual("49.0000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/div/table/tbody/tr/td[4]/div/span").text)
            self.find_element_by_css_selector("html body div#wrap div.container div div div.hidden-xs.hidden-sm div div.col-md-6 div div.table-responsive table.table.table-striped.table-condensed.table-hover tbody tr.trade-pending.disabled:nth-child(1)")
            self.assertEqual("7.185 thousand", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div/div[2]/div/div/div/span").text)
            self.assertEqual("2.815 thousand", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div/div[2]/div/div/div/span[3]").text)
            driver.find_element_by_link_text("Markets").click()
            time.sleep(3)
            driver.find_element_by_link_text("Wallet").click()
            time.sleep(3)
            driver.find_element_by_css_selector("input.form-control").clear()
            driver.find_element_by_css_selector("input.form-control").send_keys("8000")
            driver.find_element_by_xpath("//button[@type='submit']").click()
            time.sleep(1)
            self.assertEqual("Not enough ETX available for withdraw, got 7.185 thousand, needs 8 thousand", driver.find_element_by_css_selector("h4.text-center").text)
            time.sleep(1)
            driver.find_element_by_css_selector("p.text-center > button.btn.btn-default").click()

            driver.find_element_by_xpath("(//input[@type='number'])[2]").clear()
            driver.find_element_by_xpath("(//input[@type='number'])[2]").send_keys("1500")
            driver.find_element_by_xpath("(//button[@type='submit'])[2]").click()
            time.sleep(3)
            driver.find_element_by_css_selector("div.modal-footer > button.btn.btn-primary").click()
            time.sleep(5)
            self.assertEqual("69 billion", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[3]/div/div/div[2]/div/div/table/tbody/tr/td[4]/div/span[5]").text)
            driver.find_element_by_xpath("//div[@id='navbar-collapse']/ul[2]/li/a/span[3]").click()
            time.sleep(3)
            self.assertEqual("15", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div/div[2]/table/tbody/tr[4]/td[2]").text)

            driver.save_screenshot('screenshot-final.png')

        except:
            driver.save_screenshot('screenshot-fail.png')

        self.tearDown()


    def tearDown(self):
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
