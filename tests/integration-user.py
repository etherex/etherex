# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
import unittest, time, re

class EndUser(unittest.TestCase):
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
        driver.save_screenshot('screenshot-user.png')

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
            # self.assertEqual("1,039.1100 ether", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div/div/span").text)
            self.assertEqual("0", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div[2]/div/div/div").text)
            self.assertEqual("0", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div[2]/div/div[2]/div").text)
            # self.assertEqual("10 billion", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div[2]/div/div[3]/div").text)

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

            # Click-fill first three trades
            driver.find_element_by_xpath("//*[@id='wrap']/div/div[4]/div[2]/div[3]/div/div[1]/div/div/table/tbody/tr[3]").click()
            time.sleep(1)

            # Assert amount, price and total got filled
            self.assertEqual("450", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[1]/div[2]/div[2]/div[1]/div/form/div[1]/div/input").get_attribute("value"))
            self.assertEqual("0.25", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[1]/div[2]/div[2]/div[1]/div/form/div[2]/div/input").get_attribute("value"))
            self.assertEqual("112.5", driver.find_element_by_xpath("//div[@id='wrap']/div/div[4]/div[1]/div[2]/div[2]/div[1]/div/form/div[3]/div/input").get_attribute("value"))

            # Fill trades
            driver.find_element_by_xpath("//*[@id='wrap']/div/div[4]/div[1]/div[2]/div[2]/div[1]/div/form/div[4]/button").click()
            time.sleep(1)

            # Assert filling trades message
            self.assertEqual("You will be filling 3 trades for a total of 112.50000 ether.", driver.find_element_by_css_selector("div.modal.fade.in > div > div > form > div.modal-body > span").text)
            time.sleep(1)

            # Click Yes
            driver.find_element_by_css_selector("div.modal-footer > button.btn.btn-primary").click()
            time.sleep(1)

            # Assert new sub-balance
            self.assertEqual("4.5 hundred", driver.find_element_by_xpath("//div[@id='wrap']/div/div[2]/div[2]/div/div[1]/div").text)

            # Assert new Last price
            time.sleep(15)
            self.assertEqual("0.25000000 ETX/ETH", driver.find_element_by_xpath("//div[@id='wrap']/div/div[3]/div/div/span[2]").text)

            driver.save_screenshot('screenshot-user-passed.png')

        except Exception as e:
            driver.save_screenshot('screenshot-user-fail.png')
            self.fail(e)
            driver.quit()

        self.assertEqual([], self.verificationErrors)

        driver.quit()
