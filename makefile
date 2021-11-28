recreate-dev:
	ansible-playbook ./playbooks/init.yml --limit=sc-actions-dev

recreate-prod:
	ansible-playbook ./playbooks/init.yml --limit=sc-actions
