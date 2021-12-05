create-dev:
	ansible-playbook -i ansible/hosts.yml ./ansible/playbooks/init.yml --limit sc-actions-dev --extra-vars '{"doppler_service_tokens":""}'

create-prod:
	ansible-playbook -i ansible/hosts.yml ./ansible/playbooks/init.yml --limit sc-actions --extra-vars '{"doppler_service_tokens":""}'

update-dev:
	ansible-playbook -i ansible/hosts.yml ./ansible/playbooks/init.yml --limit sc-actions-dev --extra-vars '{"branch":"develop"}'

update-prod:
	ansible-playbook -i ansible/hosts.yml ./ansible/playbooks/init.yml --limit sc-actions --extra-vars '{"branch":"main"}'
