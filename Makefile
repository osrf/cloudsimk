jenkins:
	@JUNIT_REPORT_PATH=report.xml ./node_modules/.bin/mocha --reporter mocha-jenkins-reporter || true

install:
	npm install

.PHONY: jenkins
