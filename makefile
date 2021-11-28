recreate-dev:
	cd ./ansible && ansible-playbook ./playbooks/init.yml --limit=sc-actions-dev

recreate-prod:
	cd ./ansible && ansible-playbook ./playbooks/init.yml --limit=sc-actions
