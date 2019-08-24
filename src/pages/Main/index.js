import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List } from './styles';

export default class Main extends Component {
	state = {
		newRepo: '',
		repositories: [],
		loading: false,
		error: null,
		placeholderMessage: 'Adicionar repositório',
	};

	componentDidMount() {
		const repositories = localStorage.getItem('repositories');
		if (repositories) {
			this.setState({ repositories: JSON.parse(repositories) });
		}
	}

	componentDidUpdate(_, prevState) {
		const { repositories } = this.state;
		if (prevState.repositories !== repositories) {
			localStorage.setItem('repositories', JSON.stringify(repositories));
		}
	}

	handleInputChange = e => {
		this.setState({ newRepo: e.target.value, error: null });
	};

	handleSubmit = async e => {
		e.preventDefault();

		this.setState({ loading: true, error: false });

		try {
			const { newRepo, repositories } = this.state;

			const response = await api.get(`/repos/${newRepo}`);

			const data = {
				name: response.data.full_name,
			};

			if (repositories.find(repo => repo.name === newRepo)) {
				this.setState({ placeholderMessage: 'Repositório duplicado' });
				throw new Error('Repositório duplicado');
			}

			this.setState({
				repositories: [...repositories, data],
				placeholderMessage: 'Adicionar repositório',
			});
		} catch (error) {
			const { placeholderMessage } = this.state;
			if (placeholderMessage === 'Adicionar repositório') {
				this.setState({ placeholderMessage: 'Repositório inexistente' });
			}
			this.setState({ error: true });
		} finally {
			this.setState({ loading: false, newRepo: '' });
		}
	};

	render() {
		const {
			newRepo,
			loading,
			repositories,
			error,
			placeholderMessage,
		} = this.state;
		return (
			<Container>
				<h1>
					<FaGithubAlt />
					Repositórios
				</h1>

				<Form onSubmit={this.handleSubmit} error={error}>
					<input
						type="text"
						placeholder={placeholderMessage}
						value={newRepo}
						onChange={this.handleInputChange}
					/>
					<SubmitButton loading={loading}>
						{loading ? (
							<FaSpinner color="#FFF" size={14} />
						) : (
							<FaPlus color="#FFF" size={14} />
						)}
					</SubmitButton>
				</Form>

				<List>
					{repositories.map(repository => (
						<li key={repository.name}>
							<span>{repository.name}</span>
							<Link to={`/repository/${encodeURIComponent(repository.name)}`}>
								Detalhes
							</Link>
						</li>
					))}
				</List>
			</Container>
		);
	}
}
