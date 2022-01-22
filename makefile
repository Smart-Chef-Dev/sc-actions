create:
	@read -p "Enter doppler service tokens: " doppler_service_token; \
	read -p "Select enviroment [dev, prod]: " enviroment; \
    if [ $$enviroment = "dev" ]; then \
    	ansible-playbook -i ansible/hosts.yml ./ansible/playbooks/init.yml --limit sc-actions-dev --extra-vars "{\"doppler_service_token\":\"$$doppler_service_token\"}"; \
    elif [ $$enviroment = "prod" ]; then \
    	ansible-playbook -i ansible/hosts.yml ./ansible/playbooks/init.yml --limit sc-actions --extra-vars "{\"doppler_service_token\":\"$$doppler_service_token\"}"; \
    else \
    	echo "Sorry, your reply was invalid. Please try again."; \
    fi

update:
	@read -p "Select enviroment [dev, prod]:" enviroment; \
	if [ $$enviroment = "dev" ]; then \
    	ansible-playbook -i ansible/hosts.yml ./ansible/playbooks/update.yml --limit sc-actions-dev --extra-vars '{"branch":"develop"}'; \
   	elif [ $$enviroment = "prod" ]; then \
    	ansible-playbook -i ansible/hosts.yml ./ansible/playbooks/update.yml --limit sc-actions --extra-vars '{"branch":"main"}'; \
    else \
    	echo "Sorry, your reply was invalid. Please try again."; \
    fi
