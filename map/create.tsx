import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { Api } from 'pages/paradb/base/api/api';
import { useComponentDidMount } from 'pages/paradb/base/helpers';
import { MapPage } from 'pages/paradb/map/map_page';
import { MapPagePresenter, MapPageStore } from 'pages/paradb/map/map_presenter';
import { ComplexitiesList, SubmitMapPage } from 'pages/paradb/map/submit_map';
import { SubmitMapPresenter, SubmitMapStore } from 'pages/paradb/map/submit_map_presenter';
import { Navigate } from 'pages/paradb/router/install';
import { PDMap } from 'paradb-api-schema';
import React from 'react';

export function createMapPage(api: Api) {
  const store = new MapPageStore();
  const presenter = new MapPagePresenter(api, store);

  return observer(({ id, map }: { id: string, map: PDMap | undefined }) => {
    useComponentDidMount(() => {
      if (map) {
        runInAction(() => store.map = map);
      } else {
        presenter.getMap(id);
      }
    });

    return (
      <MapPage
        map={store.map}
      />
    );
  });
}

export function createSubmitMapPage(api: Api, navigate: Navigate) {
  let store: SubmitMapStore = new SubmitMapStore();
  let presenter = new SubmitMapPresenter(api, navigate, store);
  let mounted = false;

  return observer(() => {
    useComponentDidMount(() => {
      if (!mounted) {
        mounted = true;
      } else {
        store.reset();
      }
    });

    const Complexities = observer(() => (
      <ComplexitiesList
        complexities={store.complexities}
        errors={store.errors}
        isSubmitting={store.isSubmitting}
        onComplexityAdd={presenter.addComplexity}
        onComplexityRemove={presenter.removeComplexity}
      />
    ));

    return (
      <SubmitMapPage
        title={store.title}
        artist={store.artist}
        author={store.author}
        albumArt={store.albumArt}
        description={store.description}
        downloadLink={store.downloadLink}
        errors={store.errors}
        isSubmitting={store.isSubmitting}
        onChangeTitle={presenter.onChangeTitle}
        onChangeArtist={presenter.onChangeArtist}
        onChangeAuthor={presenter.onChangeAuthor}
        onChangeAlbumArt={presenter.onChangeAlbumArt}
        onChangeDescription={presenter.onChangeDescription}
        onChangeDownloadLink={presenter.onChangeDownloadLink}
        onSubmit={presenter.submit}
        ComplexitiesList={Complexities}
      />
    );
  });
}
