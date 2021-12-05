create-dev:
	@read -p "Enter doppler service tokens:" doppler_service_tokens; \
	ansible-playbook -i ansible/hosts.yml ./ansible/playbooks/init.yml --limit sc-actions-dev --extra-vars '{"doppler_service_tokens":"$$doppler_service_tokens"}'

create-prod:
	@read -p "Enter doppler service tokens:" doppler_service_tokens; \
	ansible-playbook -i ansible/hosts.yml ./ansible/playbooks/init.yml --limit sc-actions --extra-vars '{"doppler_service_tokens":"$$doppler_service_tokens"}'

update-dev:
	ansible-playbook -i ansible/hosts.yml ./ansible/playbooks/init.yml --limit sc-actions-dev --extra-vars '{"branch":"develop"}'

update-prod:
	ansible-playbook -i ansible/hosts.yml ./ansible/playbooks/init.yml --limit sc-actions --extra-vars '{"branch":"main"}'
