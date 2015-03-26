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
        self.driver.set_window_size(1280, 1200)

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
            # Assert balance and sub-balances
            self.assertEqual("1,606,938.0443 Uether", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div/div/span").text)
            self.assertEqual("7.435 thousand", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div[2]/div/div/div").text)
            self.assertEqual("2.565 thousand", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div[2]/div/div[2]/div").text)
            self.assertEqual("69 billion", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div[2]/div/div[3]/div").text)

            # Assert no price set
            self.assertEqual("N/A ETX/ETH", driver.find_element_by_xpath("//div[@id='wrap']/div/div[3]/div/div/span[2]").text)

            # Assert trade table headers
            self.assertEqual("Trades", driver.find_element_by_xpath("//*[@id='wrap']/div/div[4]/div[2]/div[1]/div[1]/h3/span[1]").text)
            self.assertEqual("Asks", driver.find_element_by_xpath("//*[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[1]/div/h4").text)
            self.assertEqual("Bids", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/h4").text)

            # Assert added asks
            self.assertEqual("50.00000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr/td/div").text)
            self.assertEqual("150.00000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr[2]/td/div").text)
            self.assertEqual("0.32000000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr[10]/td[3]/div").text)

            # Assert added bids
            self.assertEqual("0.24000000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/div/table/tbody/tr/td[3]/div").text)
            self.assertEqual("10.5000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/div/table/tbody/tr[4]/td[4]/div/span").text)

            # Switch market
            driver.find_element_by_xpath("(//button[@type='button'])[2]").click()
            driver.find_element_by_link_text("CAK").click()

            # Assert sub-balances
            self.assertEqual("820 thousand", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div[2]/div/div/div").text)
            self.assertEqual("180 thousand", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div[2]/div/div[2]/div").text)
            self.assertEqual("30 billion", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div[2]/div/div[3]/div").text)

            # Assert added trades
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

            # Switch market again
            driver.find_element_by_xpath("(//button[@type='button'])[2]").click()
            driver.find_element_by_link_text("MID").click()

            # Assert added trades
            self.assertEqual("0.0025", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr/td[3]/div").text)
            self.assertEqual("0.0026", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr[2]/td[3]/div").text)
            self.assertEqual("0.0024", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/div/table/tbody/tr/td[3]/div").text)

            # Switch back to first market
            driver.find_element_by_xpath("(//button[@type='button'])[2]").click()
            driver.find_element_by_link_text("ETX").click()

            # Add a trade
            driver.find_element_by_xpath("(//input[@type='number'])[7]").clear()
            driver.find_element_by_xpath("(//input[@type='number'])[7]").send_keys("500")
            driver.find_element_by_xpath("(//input[@type='number'])[8]").clear()
            driver.find_element_by_xpath("(//input[@type='number'])[8]").send_keys("0.255")
            driver.find_element_by_xpath("(//input[@type='number'])[8]").send_keys("0")
            driver.find_element_by_xpath("(//button[@type='submit'])[3]").click()
            time.sleep(1)
            driver.find_element_by_css_selector("div.modal-footer > button.btn.btn-primary").click()

            # Assert buy trade added
            for i in range(30):
                time.sleep(1)
                try:
                    if "500.00000" == driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr[4]/td/div").text: break
                except: pass
            else: self.fail("time out")
            self.assertEqual("0.25500000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr[4]/td[3]/div").text)
            self.assertEqual("127.5000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div/div/div/table/tbody/tr[4]/td[4]/div/span").text)
            # self.find_element_by_css_selector("html body div#wrap div.container div div div.hidden-xs.hidden-sm div div.col-md-6 div div.table-responsive table.table.table-striped.table-condensed.table-hover tbody tr.trade-pending.disabled:nth-child(4)")

            # Cancel first sell trade
            driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[1]/div/div/table/tbody/tr[1]/td[6]/div/button").click()
            time.sleep(1)
            driver.find_element_by_css_selector("div.modal-footer > button.btn.btn-primary").click()

            # Add sell trade
            driver.find_element_by_css_selector("div.col-md-6 > div.container-fluid > form.form-horizontal > div.form-group > div.input-group > input.form-control.medium").clear()
            driver.find_element_by_css_selector("div.col-md-6 > div.container-fluid > form.form-horizontal > div.form-group > div.input-group > input.form-control.medium").send_keys("200")
            driver.find_element_by_xpath("(//input[@type='number'])[5]").clear()
            driver.find_element_by_xpath("(//input[@type='number'])[5]").send_keys("0.245")
            driver.find_element_by_xpath("(//input[@type='number'])[5]").send_keys("0")
            driver.find_element_by_xpath("(//button[@type='submit'])[2]").click()
            time.sleep(1)
            driver.find_element_by_css_selector("div.modal-footer > button.btn.btn-primary").click()

            # Assert trade added
            for i in range(30):
                time.sleep(1)
                try:
                    if "200.00000" == driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/div/table/tbody/tr/td/div").text: break
                except: pass
            else: self.fail("time out")
            self.assertEqual("0.24500000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/div/table/tbody/tr/td[3]/div").text)
            self.assertEqual("49.0000", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[2]/div/div/table/tbody/tr/td[4]/div/span").text)
            # self.find_element_by_css_selector("html body div#wrap div.container div div div.hidden-xs.hidden-sm div div.col-md-6 div div.table-responsive table.table.table-striped.table-condensed.table-hover tbody tr.trade-pending.disabled:nth-child(1)")

            # Assert new sub-balances
            self.assertEqual("6.985 thousand", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div[2]/div/div/div").text)
            self.assertEqual("3.015 thousand", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div[2]/div/div[2]/div").text)

            # Switch to Markets section
            driver.find_element_by_link_text("Markets").click()

            # Switch to Wallet section
            driver.find_element_by_link_text("Wallet").click()

            # Withdraw more than available sub-balance
            driver.find_element_by_css_selector("input.form-control").clear()
            driver.find_element_by_css_selector("input.form-control").send_keys("8000")
            driver.find_element_by_xpath("//button[@type='submit']").click()

            # Assert not enough for withdrawal
            self.assertEqual("Not enough ETX available for withdraw, got 6.985 thousand, needs 8 thousand", driver.find_element_by_css_selector("h4.text-center").text)
            driver.find_element_by_css_selector("p.text-center > button.btn.btn-default").click()

            # Deposit into exchange
            driver.find_element_by_xpath("(//input[@type='number'])[2]").clear()
            driver.find_element_by_xpath("(//input[@type='number'])[2]").send_keys("1500")
            driver.find_element_by_xpath("(//button[@type='submit'])[2]").click()
            time.sleep(1)
            driver.find_element_by_css_selector("div.modal-footer > button.btn.btn-primary").click()

            # Assert balance
            self.assertEqual("69 billion", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div[2]/div/div[3]/div").text)

            # Switch to user section
            for i in range(5):
                time.sleep(1)
                try:
                    driver.find_element_by_xpath("//div[@id='navbar-collapse']/ul[2]/li/a").click()
                    break
                except: pass
            else: self.fail("time out")

            # Assert number of transactions
            self.assertEqual("15", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div/div[2]/table/tbody/tr[4]/td[2]").text)

            driver.save_screenshot('screenshot-passed.png')

        except Exception as e:
            driver.save_screenshot('screenshot-fail.png')
            self.fail(e)
            driver.quit()

        self.assertEqual([], self.verificationErrors)

        driver.quit()
